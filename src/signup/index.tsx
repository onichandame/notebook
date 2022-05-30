import { classValidatorResolver } from "@hookform/resolvers/class-validator";
import { Button, Grid, TextField } from "@mui/material";
import { FC, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";

import { useService, useUser } from "../backend";
import { CreateUserForm } from "../model";

const resolver = classValidatorResolver(CreateUserForm);

export const Signup: FC = () => {
  const navigate = useNavigate();
  const user = useUser();
  const svc = useService();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateUserForm>({ resolver });
  useEffect(() => {
    if (user) navigate(`/`);
  }, [user]);
  return (
    <form
      onSubmit={handleSubmit(async (vals) => {
        await svc.createUser({
          name: vals.name,
          password: vals.password,
          email: vals.email,
          avatar: vals.avatar,
        });
        navigate(
          `/login?identity=${vals.name}&password=${vals.password}&autoSubmit=true`
        );
      })}
    >
      <Grid container direction="column" alignItems="center" spacing={2}>
        <Grid item>
          <TextField
            required
            label="Username"
            error={!!errors.name}
            helperText={errors.name?.message}
            {...register(`name`)}
          />
        </Grid>
        <Grid item>
          <TextField
            required
            label="Password"
            type="password"
            autoComplete="new-password"
            error={!!errors.password}
            helperText={errors.password?.message}
            {...register(`password`)}
          />
        </Grid>
        <Grid item>
          <TextField
            required
            label="Re-type Password"
            type="password"
            autoComplete="new-password"
            error={!!errors.password2}
            helperText={errors.password2?.message}
            {...register(`password2`)}
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
            sign up
          </Button>
        </Grid>
        <Grid item>
          <Link to="/login">log in</Link>
        </Grid>
      </Grid>
    </form>
  );
};
