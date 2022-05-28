import { Button, Grid, TextField, Typography } from "@mui/material";
import { useForm } from "react-hook-form";
import { classValidatorResolver } from "@hookform/resolvers/class-validator";
import { FC, useCallback, useEffect, useState } from "react";
import { useParams } from "react-router-dom";

import { Note } from "../../model";
import ReactMarkdown from "react-markdown";
import { Delete } from "./delete";
import { Loading } from "../../common";
import { useDb } from "../../db";
import { IsOptional, IsString } from "class-validator";
import { DocumentType } from "@onichandame/type-rxdb";

class UpdateNoteForm implements Partial<Note> {
  @IsOptional()
  @IsString()
  title?: string;
  @IsOptional()
  @IsString()
  content?: string;
}

const resolver = classValidatorResolver(UpdateNoteForm);

export const Detail: FC = () => {
  const [editing, setEditing] = useState(false);
  const [note, setNote] = useState<DocumentType<typeof Note> | null>(null);
  const params = useParams();
  const [cacheKey, setCacheKey] = useState(``);
  const db = useDb();
  const {
    register,
    handleSubmit,
    reset,
    getValues,
    formState: { errors, isSubmitting },
  } = useForm<UpdateNoteForm>({
    resolver,
  });
  const resetForm = useCallback(() => {
    reset({
      title: note?.title,
      content: note?.content,
    });
  }, [reset, note]);
  const updateNote = useCallback(async () => {
    if (!params.id) return;
    const note = await db?.notes.findOne().and(
      [{ id: params.id }, { deletedAt: { $exists: false } }] as any,
    ).exec();
    if (note) {
      setNote(note);
    }
  }, [db, params]);
  useEffect(() => {
    updateNote();
  }, [updateNote]);
  useEffect(() => {
    const cache = window.localStorage.getItem(cacheKey);
    if (cache) reset(JSON.parse(cache));
    else if (note) resetForm();
  }, [note, cacheKey, resetForm]);
  useEffect(() => {
    if (params.id) {
      setCacheKey([`update`, `cache`, `note`, params.id].join(`:`));
    }
  }, [params]);
  return note
    ? (
      <form
        onSubmit={handleSubmit(async () => {
          await note?.save();
          cacheKey && window.localStorage.removeItem(cacheKey);
          await updateNote();
          setEditing(false);
        })}
      >
        <Grid container direction="column" spacing={4}>
          <Grid item>
            {editing && (
              <TextField
                label="title"
                size="small"
                fullWidth
                error={!!errors.title}
                helperText={errors.title?.message}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  sx: { fontSize: (theme) => theme.typography.h4.fontSize },
                }}
                {...register(`title`, {
                  onChange: () => {
                    cacheKey &&
                      window.localStorage.setItem(
                        cacheKey,
                        JSON.stringify(getValues()),
                      );
                  },
                })}
              />
            )}
            {!editing && (
              <Grid
                container
                direction="row"
                justifyContent="space-between"
                alignItems="center"
              >
                <Grid item>
                  <Typography variant="h3">{note.title}</Typography>
                </Grid>
                <Grid item>
                  <Grid container direction="row" spacing={2}>
                    <Grid item>
                      <Button
                        variant="contained"
                        onClick={() => {
                          setEditing(true);
                        }}
                      >
                        edit
                      </Button>
                    </Grid>
                    <Grid item>
                      <Delete note={note} />
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            )}
          </Grid>
          <Grid item>
            {editing && (
              <TextField
                label="Content"
                multiline
                fullWidth
                error={!!errors.content}
                helperText={errors.content?.message}
                {...register(`content`, {
                  onChange: () => {
                    cacheKey &&
                      window.localStorage.setItem(
                        cacheKey,
                        JSON.stringify(getValues()),
                      );
                  },
                })}
              />
            )}
            {!editing && note.content && (
              <ReactMarkdown>{note.content}</ReactMarkdown>
            )}
          </Grid>
          {editing && (
            <Grid item>
              <Grid container direction="row" justifyContent="end" spacing={3}>
                <Grid item>
                  <Button
                    variant="contained"
                    type="submit"
                    disabled={isSubmitting}
                  >
                    save & exit
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="contained"
                    color="warning"
                    onClick={() => {
                      cacheKey && window.localStorage.removeItem(cacheKey);
                      resetForm();
                    }}
                  >
                    reset
                  </Button>
                </Grid>
                <Grid item>
                  <Button
                    variant="contained"
                    color="secondary"
                    onClick={() => {
                      setEditing(false);
                    }}
                    disabled={isSubmitting}
                  >
                    cancel
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          )}
        </Grid>
      </form>
    )
    : <Loading />;
};
