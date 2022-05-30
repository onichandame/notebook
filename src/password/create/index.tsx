import { classValidatorResolver } from "@hookform/resolvers/class-validator";
import { Button, Grid, TextField } from "@mui/material";
import { IsOptional, IsString } from "class-validator";
import { FC } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { IconField } from "../../common";
import { useDb } from "../../db";
import { Password } from "../../model";

class CreatePasswordForm implements Partial<Password> {
  @IsString()
  title!: string;
  @IsString()
  password!: string;
  @IsOptional()
  @IsString()
  icon?: string;
  @IsOptional()
  @IsString()
  url?: string;
  @IsOptional()
  @IsString()
  username?: string;
}

const resolver = classValidatorResolver(CreatePasswordForm);

export const Create: FC = () => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreatePasswordForm>({
    resolver,
  });
  const navigate = useNavigate();
  const db = useDb();
  return (
    <form
      onSubmit={handleSubmit(async (vals) => {
        await db?.passwords.insert(vals as any);
        navigate(-1);
      })}
    >
      <Grid container direction="column" spacing={2} alignItems="center">
        <Grid item>
          <Grid container direction="row" spacing={2} justifyContent="center">
            <Grid item>
              <Controller
                control={control}
                name="icon"
                render={({ field }) => (
                  <IconField
                    value={typeof field.value === `string` ? field.value : null}
                    onConfirm={(val) => field.onChange(val)}
                  />
                )}
              />
            </Grid>
            <Grid item>
              <Controller
                control={control}
                name="title"
                render={({ field }) => (
                  <TextField
                    required
                    label="Title"
                    error={!!errors.title}
                    helperText={errors.title?.message}
                    onChange={(e) => field.onChange(e.target.value)}
                  />
                )}
              />
            </Grid>
          </Grid>
        </Grid>
        <Grid item>
          <Controller
            control={control}
            name="username"
            render={({ field }) => (
              <TextField
                label="Username"
                error={!!errors.username}
                helperText={errors.username?.message}
                onChange={(e) => field.onChange(e.target.value)}
              />
            )}
          />
        </Grid>
        <Grid item>
          <Controller
            control={control}
            name="password"
            render={({ field }) => (
              <TextField
                required
                label="Password"
                error={!!errors.password}
                helperText={errors.password?.message}
                onChange={(e) => field.onChange(e.target.value)}
              />
            )}
          />
        </Grid>
        <Grid item>
          <Controller
            control={control}
            name="url"
            render={({ field }) => (
              <TextField
                label="Website"
                error={!!errors.url}
                helperText={errors.url?.message}
                onChange={(e) => field.onChange(e.target.value)}
              />
            )}
          />
        </Grid>
        <Grid item>
          <Button type="submit" variant="contained" disabled={isSubmitting}>
            create
          </Button>
        </Grid>
      </Grid>
    </form>
  );
};
