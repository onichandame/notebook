import { Backdrop, CircularProgress } from "@mui/material";
import { FC } from "react";

export const Loading: FC = () => {
  return (
    <Backdrop open={true}>
      <CircularProgress color="info" />
    </Backdrop>
  );
};
