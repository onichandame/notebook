import { classValidatorResolver } from "@hookform/resolvers/class-validator";
import { Button, Grid, TextField } from "@mui/material";
import { FC } from "react";
import { useForm } from "react-hook-form";

import { useService, useUser, useUserSetter } from "../backend";
import { UpdateUserInput } from "../model";

const resolver = classValidatorResolver(UpdateUserInput);

export const Profile: FC = () => {
  const user = useUser();
  const setUser = useUserSetter();
  const svc = useService();
  const {
    handleSubmit,
    reset,
    register,
    formState: { errors, isSubmitting },
  } = useForm<UpdateUserInput>({
    resolver,
    defaultValues: {
      name: user?.name,
      email: user?.email,
      avatar: user?.avatar,
    },
  });
  return (
    <form
      onSubmit={handleSubmit(async (vals) => {
        await svc.updateUsers(vals);
        const user = (await svc.listUsers()).edges[0]?.node;
        if (user) setUser(user);
      })}
    >
      <Grid container direction="column" alignItems="center" spacing={2}>
        <Grid item>
          <TextField
            label="Username"
            error={!!errors.name}
            helperText={errors.name?.message}
            {...register(`name`)}
          />
        </Grid>
        <Grid item>
          <TextField
            label="Email"
            error={!!errors.email}
            helperText={errors.email?.message}
            {...register(`email`)}
          />
        </Grid>
        <Grid item>
          <TextField
            label="Avatar Link"
            error={!!errors.avatar}
            helperText={errors.avatar?.message}
            {...register(`avatar`)}
          />
        </Grid>
        <Grid item>
          <Button variant="contained" type="submit" disabled={isSubmitting}>
            update
          </Button>
        </Grid>
        <Grid item>
          <Button
            onClick={() => reset()}
            type="button"
            variant="contained"
            color="warning"
          >
            reset
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};
