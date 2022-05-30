import { Grid } from "@mui/material";
import { FC } from "react";

export const CenterRow: FC = ({ children }) => {
  return (
    <Grid container direction="column" alignItems="center">
      <Grid item>{children}</Grid>
    </Grid>
  );
};

export const CenterColumn: FC = ({ children }) => {
  return (
    <Grid container direction="row" alignItems="center">
      <Grid item>{children}</Grid>
    </Grid>
  );
};
