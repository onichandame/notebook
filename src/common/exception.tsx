import { Divider, Grid, Typography } from "@mui/material";
import { FC } from "react";
import { CenterRow } from ".";

export const Exception: FC<{ code?: number; message: string }> = ({
  code,
  message,
}) => {
  code = code || 400;
  return (
    <CenterRow>
      <Grid container direction="row" alignItems="center" spacing={2}>
        <Grid item>
          <Typography sx={{ color: (theme) => theme.palette.text.disabled }}>
            {code}
          </Typography>
        </Grid>
        <Divider orientation="vertical" flexItem />
        <Grid item>
          <Typography variant="h4">{message}</Typography>
        </Grid>
      </Grid>
    </CenterRow>
  );
};
