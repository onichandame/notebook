import { Button, Divider, Grid, TextField, Typography } from '@mui/material'
import { Controller, useForm } from 'react-hook-form'
import { classValidatorResolver } from '@hookform/resolvers/class-validator'
import { FC } from 'react'
import { useNavigate } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import { IsOptional, IsString } from 'class-validator'
import { DocumentType } from '@onichandame/type-rxdb'

import { Note } from '../../../model'
import { useSnackbar } from 'notistack'
import { formatError } from '../../../util'
import { useSync } from '../../../synchronizer'
import { Title } from '../../title'

class UpdateNoteForm implements Partial<Note> {
  @IsOptional()
  @IsString()
  title?: string
  @IsOptional()
  @IsString()
  content?: string
}

const resolver = classValidatorResolver(UpdateNoteForm)

export const Update: FC<{ note: DocumentType<typeof Note> }> = ({ note }) => {
  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar()
  const {
    handleSubmit,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<UpdateNoteForm>({
    resolver,
    defaultValues: note.toJSON(),
  })
  const title = watch(`title`)
  const content = watch(`content`)
  const sync = useSync()
  return (
    <form
      onSubmit={handleSubmit(async vals => {
        try {
          const doc = await note.atomicPatch({ ...vals, updatedAt: new Date() })
          sync?.update(doc)
          navigate(-1)
        } catch (e) {
          enqueueSnackbar(formatError(e), { variant: `error` })
        }
      })}
    >
      <Grid container direction="row" spacing={2}>
        <Grid item xs={12} md={5.5}>
          <Grid container direction="column" spacing={4}>
            <Grid item>
              <Controller
                control={control}
                name="title"
                render={({ field }) => (
                  <TextField
                    label="title"
                    size="small"
                    fullWidth
                    error={!!errors.title}
                    helperText={errors.title?.message}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      sx: { fontSize: theme => theme.typography.h4.fontSize },
                    }}
                    defaultValue={note.title}
                    onChange={e => {
                      field.onChange(e.target.value)
                    }}
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
                    label="Content"
                    multiline
                    fullWidth
                    error={!!errors.content}
                    helperText={errors.content?.message}
                    defaultValue={note.content}
                    onChange={e => {
                      field.onChange(e.target.value || undefined)
                    }}
                  />
                )}
              />
            </Grid>
            <Grid item>
              <Grid
                container
                direction="row"
                justifyContent="center"
                spacing={3}
              >
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
                    color="secondary"
                    onClick={() => {
                      navigate(-1)
                    }}
                    disabled={isSubmitting}
                  >
                    cancel
                  </Button>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Divider flexItem orientation="vertical">
          <Typography variant="caption">Preview:</Typography>{' '}
        </Divider>
        <Grid item xs={12} md={5.5}>
          <Grid container direction="row" justifySelf="stretch">
            <Grid item>
              <Title>{title}</Title>
              <ReactMarkdown>{content || ``}</ReactMarkdown>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </form>
  )
}
