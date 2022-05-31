import Peer from "peerjs";
import { createContext, FC, useContext } from "react";

import { createUuid } from "../util";

const ServerContext = createContext<Peer | null>(null);

export const ServerProvider: FC = ({ children }) => {
  return (
    <ServerContext.Provider
      value={
        new Peer(createUuid(), {
          host: `peerjs-server-xiao.herokuapp.com`,
          port: 443,
        })
      }
    >
      {children}
    </ServerContext.Provider>
  );
};

export const useServer = () => {
  const peer = useContext(ServerContext);
  if (!peer) throw new Error(`server not initialized! try to reload page`);
  return peer;
};
