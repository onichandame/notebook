import { SnackbarProvider } from "notistack";
import { FC } from "react";
import { DbProvider } from "./db";
import { Server } from "./server";

export const Global: FC = ({ children }) => {
  return (
    <SnackbarProvider maxSnack={3}>
      <DbProvider>
        <Server>{children}</Server>
      </DbProvider>
    </SnackbarProvider>
  );
};
