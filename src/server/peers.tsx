import { DataConnection } from "peerjs";
import { createContext, FC } from "react";

const PeersContext = createContext<Peer[]>([]);

export const PeersProvider: FC = ({ children }) => {
  return <PeersContext.Provider value={[]}>{children}</PeersContext.Provider>;
};

class Peer {
  constructor(private connection: DataConnection) {}

  public async send() {}
}
