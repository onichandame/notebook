import { classValidatorResolver } from '@hookform/resolvers/class-validator'
import { Button, Grid, InputAdornment, TextField } from '@mui/material'
import { Multiaddr } from '@multiformats/multiaddr'
import { IsString } from 'class-validator'
import { useSnackbar } from 'notistack'
import { FC } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

import { CenterRow } from '../common'
import { QrField } from '../common/qrField'
import { useDb } from '../db'
import { useSync } from '../synchronizer'
import { formatError } from '../util'

class CreatePeerForm {
  @IsString()
  id!: string
}

const resolver = classValidatorResolver(CreatePeerForm)

export const Create: FC = () => {
  const db = useDb()
  const sync = useSync()
  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar()
  const {
    setValue,
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CreatePeerForm>({ resolver })
  const getId = (addr: string) => {
    const id = new Multiaddr(addr).getPeerId()
    if (!id) throw new Error(`address ${addr} not valid`)
    return id
  }
  return (
    <form
      onSubmit={handleSubmit(async ({ id }) => {
        try {
          const peer = await db?.peers.insert({
            id: getId(id),
            multiaddrs: [id],
          })
          if (peer) sync?.connectToPeer(peer)
          navigate(-1)
        } catch (e) {
          enqueueSnackbar(formatError(e), { variant: `error` })
        }
      })}
    >
      <Grid container direction="column" alignItems="center" spacing={2}>
        <Grid item>
          <TextField
            label="Peer ID"
            error={!!errors.id}
            helperText={errors.id?.message}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <QrField onConfirm={val => setValue(`id`, val)} />
                </InputAdornment>
              ),
            }}
            {...register(`id`)}
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
  )
}
