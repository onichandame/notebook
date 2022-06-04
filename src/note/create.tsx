import { Button, Divider, Grid, TextField, Typography } from '@mui/material'
import { IsString } from 'class-validator'
import { Controller, useForm } from 'react-hook-form'
import { classValidatorResolver } from '@hookform/resolvers/class-validator'
import { useNavigate } from 'react-router'
import { FC } from 'react'

import { Note } from '../model'
import { CenterRow } from '../common'
import { useDb } from '../db'
import { useSync } from '../synchronizer'
import ReactMarkdown from 'react-markdown'
import { Title } from './title'

class CreateNoteForm implements Partial<Note> {
  @IsString()
  title!: string
  @IsString()
  content!: string
}

const resolver = classValidatorResolver(CreateNoteForm)
export const Create: FC = () => {
  const navigate = useNavigate()
  const db = useDb()
  const sync = useSync()
  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CreateNoteForm>({ resolver })
  const title = watch(`title`)
  const content = watch(`content`)
  return (
    <form
      onSubmit={handleSubmit(async vals => {
        const doc = await db?.notes.insert(vals as any)
        if (doc) sync?.update(doc)
        navigate(-1)
      })}
    >
      <Grid container direction="row" spacing={2}>
        <Grid item xs={12} md={5.5}>
          <Grid
            container
            direction="column"
            spacing={2}
            alignItems="space-between"
          >
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
                    onChange={e => field.onChange(e.target.value)}
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
                    onChange={e => field.onChange(e.target.value)}
                  />
                )}
              />
            </Grid>
            <Grid item>
              <CenterRow>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={isSubmitting}
                >
                  create
                </Button>
              </CenterRow>
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
