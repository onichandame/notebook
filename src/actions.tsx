import { SpeedDial, SpeedDialIcon } from "@mui/material";
import { FC } from "react";

export const Actions: FC = ({ children }) => {
  return (
    <SpeedDial
      icon={<SpeedDialIcon />}
      ariaLabel="note actions"
      sx={{ position: `fixed`, bottom: 16, right: 16 }}
    >
      {children}
    </SpeedDial>
  );
};
