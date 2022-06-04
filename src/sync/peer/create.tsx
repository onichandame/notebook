import { QrCode } from '@mui/icons-material'
import { Button, Grid } from '@mui/material'
import { Multiaddr } from '@multiformats/multiaddr'
import { useSnackbar } from 'notistack'
import { FC } from 'react'
import { useNavigate } from 'react-router-dom'

import { QrField } from '../../common'
import { useDb } from '../../db'
import { useSync } from '../../synchronizer'
import { formatError } from '../../util'

export const Create: FC = () => {
  const db = useDb()
  const sync = useSync()
  const navigate = useNavigate()
  const { enqueueSnackbar } = useSnackbar()
  return (
    <Grid container direction="column" alignItems="center" spacing={2}>
      <Grid item>
        <QrField
          onConfirm={async raw => {
            try {
              const multiaddrs: string[] = JSON.parse(raw)
              if (!multiaddrs.length) throw new Error(`no addresses received`)
              const id = new Multiaddr(multiaddrs[0]).getPeerId()
              if (!id) throw new Error(`peer id not valid`)
              if (!sync) throw new Error(`not connected to sync network`)
              const peer = await db?.peers.insert({
                name: id.slice(-5),
                id,
                multiaddrs,
              })
              if (!peer) throw new Error(`peer cannot be created`)
              await sync.connectToPeer(peer)
              navigate(-1)
            } catch (e) {
              enqueueSnackbar(formatError(e), { variant: `error` })
              console.error(e)
            }
          }}
        >
          <Button variant="contained" startIcon={<QrCode />}>
            scan
          </Button>
        </QrField>
      </Grid>
    </Grid>
  )
}
