import { FC } from "react";
import { PeersProvider } from "./peers";
import { ServerProvider } from "./server";

export const Server: FC = ({ children }) => {
  return (
    <ServerProvider>
      <PeersProvider>{children}</PeersProvider>
    </ServerProvider>
  );
};
