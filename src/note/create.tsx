import { Button, Grid, TextField } from "@mui/material";
import { IsString } from "class-validator";
import { Controller, useForm } from "react-hook-form";
import { classValidatorResolver } from "@hookform/resolvers/class-validator";
import { useNavigate } from "react-router";
import { FC } from "react";

import { Note } from "../model";
import { CenterRow } from "../common";
import { useDb } from "../db";

class CreateNoteForm implements Partial<Note> {
  @IsString()
  title!: string;
  @IsString()
  content!: string;
}

const resolver = classValidatorResolver(CreateNoteForm);
export const Create: FC = () => {
  const navigate = useNavigate();
  const db = useDb();
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreateNoteForm>({ resolver });
  return (
    <form
      onSubmit={handleSubmit(async (vals) => {
        await db?.notes.insert(vals as any);
        navigate(-1);
      })}
    >
      <Grid container direction="column" spacing={2} alignItems="stretch">
        <Grid item>
          <Controller
            control={control}
            name="title"
            render={({ field }) => (
              <TextField
                fullWidth
                label="Title"
                error={!!errors.title}
                helperText={errors.title?.message}
                onChange={(e) => field.onChange(e.target.value)}
              />
            )}
          />
        </Grid>
        <Grid item>
          <Controller
            control={control}
            name="content"
            render={({ field }) => (
              <TextField
                multiline
                fullWidth
                label="Content"
                error={!!errors.content}
                helperText={errors.content?.message}
                onChange={(e) => field.onChange(e.target.value)}
              />
            )}
          />
        </Grid>
        <Grid item>
          <CenterRow>
            <Button type="submit" variant="contained" disabled={isSubmitting}>
              create
            </Button>
          </CenterRow>
        </Grid>
      </Grid>
    </form>
  );
};
