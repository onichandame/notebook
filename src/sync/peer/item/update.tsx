import { classValidatorResolver } from '@hookform/resolvers/class-validator'
import { Button, Grid, TextField } from '@mui/material'
import { DocumentType } from '@onichandame/type-rxdb'
import { IsOptional, IsString, IsUrl } from 'class-validator'
import { useSnackbar } from 'notistack'
import { FC } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { IconField } from '../../../common'

import { Peer } from '../../../model'
import { formatError } from '../../../util'

class UpdatePeerForm implements Partial<Peer> {
  @IsOptional()
  @IsString()
  name?: string
  @IsOptional()
  @IsUrl()
  icon?: string
}

const resolver = classValidatorResolver(UpdatePeerForm)

export const Update: FC<{ peer: DocumentType<typeof Peer> }> = ({ peer }) => {
  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar()
  const {
    control,
    register,
    watch,
    formState: { errors, isSubmitting },
    handleSubmit,
  } = useForm<UpdatePeerForm>({ resolver })
  const icon = watch(`icon`)
  return (
    <form
      onSubmit={handleSubmit(async vals => {
        try {
          await peer.atomicPatch(vals)
          navigate(-1)
        } catch (e) {
          enqueueSnackbar(formatError(e), { variant: `error` })
          console.error(e)
        }
      })}
    >
      <Grid container direction="column" spacing={5} alignItems="center">
        <Grid item>
          <Grid container direction="row" spacing={2}>
            <Grid item>
              <Controller
                control={control}
                name="icon"
                render={({ field }) => (
                  <IconField
                    value={icon || null}
                    onConfirm={val => field.onChange(val)}
                  />
                )}
              />
            </Grid>
            <Grid item>
              <TextField
                label="Name"
                error={!!errors.name}
                helperText={errors.name?.message}
                defaultValue={peer.name}
                {...register(`name`)}
              />
            </Grid>
          </Grid>
        </Grid>
        <Grid item>
          <Grid container direction="row" spacing={2}>
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
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                type="submit"
                disabled={isSubmitting}
              >
                update
              </Button>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </form>
  )
}
