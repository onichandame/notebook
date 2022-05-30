import { classValidatorResolver } from "@hookform/resolvers/class-validator";
import { Button, Grid, IconButton, TextField } from "@mui/material";
import { IsString } from "class-validator";
import { useSnackbar } from "notistack";
import Peer, { DataConnection } from "peerjs";
import { QRCodeSVG } from "qrcode.react";
import { FC, useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { CenterRow, Loading } from "../common";
import { QrField } from "../common/qrField";
import { useDb } from "../db";
import { Synchronizer } from "./synchronizer";

class PeerForm {
  @IsString()
  id!: string;
}
const resolver = classValidatorResolver(PeerForm);

export const Sync: FC = () => {
  const [peer, setPeer] = useState<Peer | null>(null);
  const { enqueueSnackbar } = useSnackbar();
  const db = useDb();
  const [synchronizer, setSynchronizer] = useState<Synchronizer | null>(null);
  const {
    handleSubmit,
    register,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PeerForm>({ resolver });
  const handleConnection = useCallback((conn: DataConnection) => {
    let handshaked = false;
    let pending = 2;
    enqueueSnackbar(`sync request from peer ${conn.peer}`, {
      variant: `info`,
      action: (
        <Button
          onClick={async () => {
            handshaked = true;
            if (synchronizer) {
              for await (const doc of synchronizer.stream()) {
                conn.send(JSON.stringify(doc));
              }
            }
          }}
        >
          accept
        </Button>
      ),
      onClose: () => {
        if (!handshaked) conn.close();
      },
    });
    conn.on(`data`, async (data) => {
      if (!handshaked) conn.close();
      else if (typeof data !== `string`) conn.close();
      else if (synchronizer) await synchronizer.sync(JSON.parse(data));
    });
  }, [db, synchronizer]);
  useEffect(() => {
    const peer = new Peer(window.crypto.randomUUID(), {
      host: `peerjs-server-xiao.herokuapp.com`,
      port: 443,
    });
    setPeer(peer);
    return () => {
      peer.destroy();
      setPeer(null);
    };
  }, []);
  useEffect(() => {
    if (handleConnection) {
      peer?.on(`connection`, handleConnection);
    }
    return () => {
      peer?.removeAllListeners(`connection`);
    };
  }, [peer, handleConnection]);
  useEffect(() => {
    if (db) setSynchronizer(new Synchronizer(db));
  }, [db]);
  return peer
    ? (
      <CenterRow>
        <Grid container direction="column" spacing={5} alignItems="center">
          <Grid item>
            <IconButton
              onClick={() => {
                navigator.clipboard.writeText(peer.id);
                enqueueSnackbar(`id copied to clipboard`, {
                  variant: `success`,
                });
              }}
            >
              <QRCodeSVG
                value={peer.id}
                imageSettings={{
                  src:
                    `https://cdn-icons-png.flaticon.com/512/1621/1621635.png`,
                  height: 20,
                  width: 20,
                  excavate: true,
                }}
              />
            </IconButton>
          </Grid>
          <Grid item>
            <form
              onSubmit={handleSubmit(async (vals) => {
                const conn = peer?.connect(vals.id);
                let pending = 2;
                conn?.on(`open`, async () => {
                  conn.on(`data`, async (data) => {
                    if (data === `END`) {
                      pending--;
                      if (!pending) conn.close();
                    }
                    if (synchronizer && typeof data === `string`) {
                      synchronizer.sync(JSON.parse(data));
                    }
                  });
                  if (synchronizer) {
                    for await (const doc of synchronizer.stream()) {
                      conn.send(JSON.stringify(doc));
                    }
                    pending--;
                    if (!pending) conn.close();
                  }
                });
              })}
            >
              <Grid
                container
                direction="column"
                spacing={3}
                alignItems="center"
              >
                <Grid item>
                  <Grid container direction="row" alignItems="center">
                    <Grid item>
                      <TextField
                        label="Enter Peer ID"
                        error={!!errors.id}
                        helperText={errors.id?.message}
                        InputLabelProps={{ shrink: true }}
                        {...register(`id`)}
                      />
                    </Grid>
                    <Grid item>
                      <QrField onConfirm={(v) => setValue(`id`, v)} />
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item>
                  <Button variant="contained" type="submit">sync</Button>
                </Grid>
              </Grid>
            </form>
          </Grid>
        </Grid>
      </CenterRow>
    )
    : <Loading />;
};
