import { classValidatorResolver } from '@hookform/resolvers/class-validator'
import { Button, Grid, InputAdornment, TextField } from '@mui/material'
import { Multiaddr } from '@multiformats/multiaddr'
import { IsString } from 'class-validator'
import { useSnackbar } from 'notistack'
import { FC } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'

import { CenterRow } from '../common'
import { QrField } from '../common/qrField'
import { useDb } from '../db'
import { useSync } from '../synchronizer'
import { formatError } from '../util'

class CreatePeerForm {
  @IsString()
  id!: string
  @IsString({ each: true })
  multiaddrs!: string[]
}

const resolver = classValidatorResolver(CreatePeerForm)

export const Create: FC = () => {
  const db = useDb()
  const sync = useSync()
  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar()
  const {
    setValue,
    handleSubmit,
    getValues,
    formState: { isSubmitting },
  } = useForm<CreatePeerForm>({ resolver })
  return (
    <form
      onSubmit={handleSubmit(async vals => {
        try {
          const peer = await db?.peers.insert(vals)
          if (peer) sync?.connectToPeer(peer)
          navigate(-1)
        } catch (e) {
          enqueueSnackbar(formatError(e), { variant: `error` })
        }
      })}
    >
      <Grid container direction="column" alignItems="center" spacing={2}>
        <Grid item>
          <QrField
            onConfirm={raw => {
              try {
                const multiaddrs: string[] = JSON.parse(raw)
                if (!multiaddrs.length) throw new Error(`no addresses received`)
                const id = new Multiaddr(multiaddrs[0]).getPeerId()
                if (!id) throw new Error(`peer id not valid`)
                setValue(`id`, id)
                setValue(`multiaddrs`, multiaddrs)
                console.log(id, multiaddrs)
              } catch (e) {
                console.error(e)
              }
            }}
          />
        </Grid>
        <Grid item>{getValues().id}</Grid>
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
