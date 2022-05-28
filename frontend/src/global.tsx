import { SnackbarProvider } from "notistack";
import { FC } from "react";
import { DbProvider } from "./db";

export const Global: FC = ({ children }) => {
  return (
    <SnackbarProvider maxSnack={3}>
      <DbProvider>
        {children}
      </DbProvider>
    </SnackbarProvider>
  );
};
