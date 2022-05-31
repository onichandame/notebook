import { DocumentType } from "@onichandame/type-rxdb";
import Peer, { DataConnection } from "peerjs";
import {
  ContextType,
  createContext,
  FC,
  useContext,
  useEffect,
  useState,
} from "react";

import { Database, useDb } from "../db";
import { Base } from "../model/base";
import { createUuid } from "../util";

const SyncContext = createContext<Synchronizer | null>(null);

export const SyncProvider: FC = ({ children }) => {
  const [id, setId] = useState<string | null>(null);
  const db = useDb();
  useEffect(() => {
    if (!id) {
      const cacheKey = `my_sync_id`;
      const cache = window.localStorage.getItem(cacheKey);
      if (cache) {
        setId(cache);
      } else {
        setId(createUuid());
      }
    }
  }, [id, setId]);
  const [sync, setSync] = useState<ContextType<typeof SyncContext>>(null);
  useEffect(() => {
    if (id && db) {
      setSync(new Synchronizer(id, db));
    }
  }, [id, db, setSync]);
  useEffect(() => {
    const server = sync?.server;
    server?.on(`close`, () => {
      setSync(null);
    });
    return () => {
      sync?.destroy();
    };
  }, [sync, setSync]);
  return <SyncContext.Provider value={sync}>{children}</SyncContext.Provider>;
};

export const useSync = () => useContext(SyncContext);

class Synchronizer {
  public server: Peer;
  private peers = new Set<DataConnection>();

  constructor(id: string, private db: Database) {
    this.server = new Peer(id, {
      host: `peerjs-server-xiao.herokuapp.com`,
      port: 443,
    });
    const peersCacheKey = `peers_list`;
    const initalPeers = window.localStorage.getItem(peersCacheKey);
    // TODO connections
  }

  public destroy() {
    this.server.destroy();
    this.peers.forEach((v) => this.removePeer(v));
  }

  /** send updated document to all connected peers */
  public send<TDoc extends Base>(doc: DocumentType<{ new (): TDoc }>) {
    this.peers.forEach((peer) =>
      peer.send(
        JSON.stringify({
          collection: doc.collection.name,
          doc: doc.toJSON(),
          version: doc.collection.schema.version,
        } as SyncPayload)
      )
    );
  }

  private async removePeer(peer: DataConnection) {
    peer.close();
    this.peers.delete(peer);
  }
}

type SyncPayload = {
  collection: string;
  version: number;
  doc: any;
};
