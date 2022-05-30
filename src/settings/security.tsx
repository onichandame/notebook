import { classValidatorResolver } from "@hookform/resolvers/class-validator";
import { Button, Grid, TextField } from "@mui/material";
import { useSnackbar } from "notistack";
import { FC } from "react";
import { useForm } from "react-hook-form";

import { useService } from "../backend";
import { ChangePasswordForm } from "../model";

const resolver = classValidatorResolver(ChangePasswordForm);

export const Security: FC = () => {
  const svc = useService();
  const {
    handleSubmit,
    register,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordForm>({ resolver });
  const { enqueueSnackbar } = useSnackbar();
  return (
    <form
      onSubmit={handleSubmit(async (vals) => {
        if (!(await svc.checkPassword(vals.oldPassword))) {
          enqueueSnackbar(`old password incorrect`, { variant: `error` });
          return;
        }
        await svc
          .updateUsers({ password: vals.newPassword })
          .then(() => {
            enqueueSnackbar(`password changed`, { variant: `success` });
          })
          .catch((e) => {
            enqueueSnackbar(`failed to change password`, { variant: `error` });
          });
      })}
    >
      <Grid container direction="column" alignItems="center" spacing={2}>
        <Grid item>
          <TextField
            label="Old Password"
            type="password"
            autoComplete="current-password"
            error={!!errors.oldPassword}
            helperText={errors.oldPassword?.message}
            {...register(`oldPassword`)}
          />
        </Grid>
        <Grid item>
          <TextField
            label="New Password"
            type="password"
            autoComplete="new-password"
            error={!!errors.newPassword}
            helperText={errors.newPassword?.message}
            {...register(`newPassword`)}
          />
        </Grid>
        <Grid item>
          <TextField
            label="Re-type New Password"
            type="password"
            autoComplete="new-password"
            error={!!errors.newPassword2}
            helperText={errors.newPassword2?.message}
            {...register(`newPassword2`)}
          />
        </Grid>
        <Grid item>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            submit
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};
