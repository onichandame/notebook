import { Grid, Typography } from '@mui/material'
import { FC } from 'react'
import { Link } from 'react-router-dom'

import { Loading, QrCode } from '../common'
import { useSync } from '../synchronizer'

export const Info: FC = () => {
  const sync = useSync()
  return sync ? (
    <Grid container direction="column" alignItems="center">
      <Grid item>
        <Typography variant="h5" maxWidth="80vw" overflow="auto">
          Scan to sync with this device
        </Typography>
      </Grid>
      <Grid item>
        <QrCode value={JSON.stringify(sync.multiaddrs)} />
      </Grid>
      <Grid item>
        <Typography variant="h5">
          <Link to="peer"> Manage peers</Link>
        </Typography>
      </Grid>
    </Grid>
  ) : (
    <Loading />
  )
}
