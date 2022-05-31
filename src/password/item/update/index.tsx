import { classValidatorResolver } from "@hookform/resolvers/class-validator";
import { Button, Divider, Grid, TextField } from "@mui/material";
import { DocumentType } from "@onichandame/type-rxdb";
import { FC } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";

import { CenterRow, IconField } from "../../../common";
import { Password } from "../../../model";

class UpdatePasswordForm implements Partial<Password> {
  title?: string;
  password?: string;
  username?: string;
  url?: string;
  icon?: string;
}

const resolver = classValidatorResolver(UpdatePasswordForm);

export const Update: FC<{ pwd: DocumentType<typeof Password> }> = ({ pwd }) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdatePasswordForm>({
    resolver,
    defaultValues: pwd.toJSON(),
  });
  const navigate = useNavigate();
  return (
    <CenterRow>
      <form
        onSubmit={handleSubmit(async (vals) => {
          await pwd.atomicPatch({ ...vals, updatedAt: new Date() });
          navigate(-1);
        })}
      >
        <Grid container direction="column" spacing={4} alignItems="stretch">
          <Grid item>
            <CenterRow>
              <Grid container direction="row" spacing={2} alignItems="center">
                <Grid item>
                  <Controller
                    control={control}
                    name="icon"
                    render={({ field }) => (
                      <IconField
                        onConfirm={(val) => {
                          field.onChange(val);
                        }}
                        value={pwd.icon || null}
                      />
                    )}
                  />
                </Grid>
                <Grid item>
                  <CenterRow>
                    <Controller
                      control={control}
                      name="title"
                      render={({ field }) => (
                        <TextField
                          label="title"
                          error={!!errors.title}
                          helperText={errors.title?.message}
                          InputProps={{
                            sx: {
                              fontSize: (theme) => theme.typography.h5.fontSize,
                            },
                          }}
                          defaultValue={pwd.title}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      )}
                    />
                  </CenterRow>
                </Grid>
              </Grid>
            </CenterRow>
          </Grid>
          <Grid item>
            <Grid container direction="row" spacing={3}>
              <Grid item>
                <Grid
                  container
                  direction="column"
                  alignItems="center"
                  spacing={1}
                >
                  <Grid item>
                    <Controller
                      control={control}
                      name="username"
                      render={({ field }) => (
                        <TextField
                          label="Username"
                          error={!!errors.username}
                          InputLabelProps={{ shrink: true }}
                          helperText={errors.username?.message}
                          defaultValue={pwd.username}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      )}
                    />
                  </Grid>
                  <Divider />
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
                          defaultValue={pwd.password}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Grid>
              <Grid item>
                <Grid container direction="column">
                  <Grid item>
                    <Controller
                      control={control}
                      name="url"
                      render={({ field }) => (
                        <TextField
                          label="Website"
                          InputLabelProps={{ shrink: true }}
                          error={!!errors.url}
                          helperText={errors.url?.message}
                          defaultValue={pwd.url}
                          onChange={(e) => field.onChange(e.target.value)}
                        />
                      )}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
          <Grid item>
            <Grid container direction="row" spacing={2} justifyContent="center">
              <>
                <Grid item>
                  <Button
                    fullWidth
                    type="submit"
                    variant="contained"
                    disabled={isSubmitting}
                  >
                    save & exit
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    fullWidth
                    color="secondary"
                    variant="contained"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(-1);
                    }}
                    disabled={isSubmitting}
                  >
                    cancel
                  </Button>
                </Grid>
              </>
            </Grid>
          </Grid>
        </Grid>
      </form>
    </CenterRow>
  );
};
