import { FC, useEffect, useRef } from "react";
import { classValidatorResolver } from "@hookform/resolvers/class-validator";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Button, Grid, TextField } from "@mui/material";

import { useService, useUser, useSessionSetter } from "../backend";
import { LoginInput } from "../model";
import { useForm } from "react-hook-form";

const resolver = classValidatorResolver(LoginInput);

export const Login: FC = () => {
  const setSession = useSessionSetter();
  const user = useUser();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const svc = useService();
  const {
    handleSubmit,
    register,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver });
  const form = useRef<null | HTMLFormElement>(null);
  const submitButton = useRef<null | HTMLButtonElement>(null);
  useEffect(() => {
    if (params) {
      const identity = params.get(`identity`);
      if (identity) setValue(`identity`, identity);
      const password = params.get(`password`);
      if (password) setValue(`password`, password);
      if (params.get(`autoSubmit`)) submitButton?.current?.click();
    }
  }, [submitButton, params]);
  useEffect(() => {
    if (user) navigate(decodeURIComponent(params.get(`redirect`) || `/`));
  }, [user]);
  return (
    <form
      ref={form}
      onSubmit={handleSubmit(async (vals) => {
        setSession(await svc.login(vals));
      })}
    >
      <Grid container direction="column" spacing={2} alignItems="center">
        <Grid item>
          <TextField
            required
            label="Username/Email"
            error={!!errors.identity}
            helperText={errors.identity?.message}
            {...register(`identity`)}
          />
        </Grid>
        <Grid item>
          <TextField
            required
            autoComplete="current-password"
            label="Password"
            type="password"
            error={!!errors.password}
            helperText={errors.password?.message}
            {...register(`password`)}
          />
        </Grid>
        <Grid item>
          <Button
            ref={submitButton}
            variant="contained"
            type="submit"
            disabled={isSubmitting}
          >
            log in
          </Button>
        </Grid>
        <Grid item>
          <Link to="/signup">sign up</Link>
        </Grid>
      </Grid>
    </form>
  );
};
