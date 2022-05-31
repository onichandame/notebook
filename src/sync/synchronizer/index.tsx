import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  LinearProgress,
} from "@mui/material";
import { ReturnCollectionType } from "@onichandame/type-rxdb";
import { useSnackbar } from "notistack";
import { DataConnection } from "peerjs";
import { FC, useCallback, useEffect, useState } from "react";
import { isRxCollection } from "rxdb";

import { useDb } from "../../db";
import { Base } from "../../model/base";

type Props = {
  conn: DataConnection;
  onClose: () => void;
  db: NonNullable<ReturnType<typeof useDb>>;
  autoVerified?: boolean;
};

export const Synchronizer: FC<Props> = (
  { conn, onClose, db, autoVerified },
) => {
  const [verified, setVerified] = useState(autoVerified);
  const [streamDone, setStreamDone] = useState(false);
  const [remoteVerified, setRemoteVerified] = useState(!autoVerified);
  const [remoteSreamDone, setRemoteStreamDone] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const stream = useCallback(async () => {
    const collections: (keyof typeof db)[] = [
      `notes`,
      `passwords`,
    ];
    async function* streamCollection(col: keyof typeof db) {
      const collection: ReturnCollectionType<typeof Base> = db[col];
      if (isRxCollection(collection)) {
        const docs = await collection.find().exec();
        for (const doc of docs) {
          yield {
            total: docs.length,
            doc,
            version: db[col].schema.version,
            collection: `notes`,
          };
        }
      }
    }
    for (const collection of collections) {
      for await (const doc of streamCollection(collection)) {
        conn
          .send(JSON.stringify(doc));
      }
    }
    conn.send(`DONE`);
    setStreamDone(true);
  }, [db, conn]);
  useEffect(() => {
    const dataHandler = async (data: unknown) => {
      if (typeof data !== `string`) {
        throw new Error(`sync data must be stringified`);
      }
      if (data === `DONE`) {
        setRemoteStreamDone(true);
      } else if (data === `OK`) {
        setRemoteVerified(true);
      } else if (verified) {
        const doc: Document = JSON.parse(data);
        const col: ReturnCollectionType<typeof Base> =
          db[doc.collection as keyof typeof db];
        if (!isRxCollection(col)) {
          throw new Error(`collection ${doc.collection} not exists`);
        }
        let shouldSync = true;
        const local = await col.findOne().where(`id`).eq(doc.doc.id)
          .exec();
        if (local) {
          if (doc.doc.updatedAt) {
            if (local.updatedAt) {
              if (
                compareDates(local.updatedAt, doc.doc.updatedAt)
              ) {
                shouldSync = false;
              }
            }
          }
        }
        if (shouldSync) await col.atomicUpsert(doc.doc);
      }
    };
    conn.on(`data`, dataHandler);
    return () => {
      conn.removeListener(`data`, dataHandler);
    };
  }, [conn, verified]);
  useEffect(() => {
    if (verified && remoteVerified) {
      stream();
    }
  }, [verified, remoteVerified, stream]);
  useEffect(() => {
    if (verified) conn.send(`OK`);
  }, [verified, conn]);
  useEffect(() => {
    if (streamDone && remoteSreamDone) {
      enqueueSnackbar(`sync done`, { variant: `success` });
      setTimeout(onClose, 100); // TODO required to allow remote to receive DONE message. need to refine the workflow to eliminate this
    }
  }, [streamDone, remoteSreamDone]);
  return (
    <Dialog open={true} onClose={onClose}>
      {verified && <LinearProgress />}
      <DialogTitle>Synchronize with Peer</DialogTitle>
      <DialogContent>
        <DialogContentText>
          Connection ID: {conn.connectionId}
        </DialogContentText>
        <DialogContentText>
          {verified ? `Synchronizing...` : `Do you want to verify this peer?`}
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        {verified
          ? (
            <>
              <Button color="secondary" onClick={() => onClose()}>
                cancel
              </Button>
            </>
          )
          : (
            <>
              <Button
                color="secondary"
                onClick={() => {
                  onClose();
                }}
              >
                no
              </Button>
              <Button
                color="primary"
                onClick={async () => {
                  setVerified(true);
                }}
              >
                yes
              </Button>
            </>
          )}
      </DialogActions>
    </Dialog>
  );
};

/** @returns true if {@link d1} is later than {@link d2}*/
function compareDates(d1: DateLike, d2: DateLike) {
  return new Date(d1).getTime() > new Date(d2).getTime();
}

type DateLike = Date | string | number;

type Document = {
  collection: string;
  version: number;
  doc: Base;
  total: number;
};
