import { Grid, Typography } from '@mui/material'
import { DocumentType } from '@onichandame/type-rxdb'
import { FC } from 'react'
import { useNavigate } from 'react-router-dom'

import { Confirm } from '../../common'
import { Peer } from '../../model'
import { useSync } from '../../synchronizer'

export const Detail: FC<{ peer: DocumentType<typeof Peer> }> = ({ peer }) => {
  const navigate = useNavigate()
  const sync = useSync()
  return (
    <Grid container direction="column" alignItems="center" spacing={5}>
      <Grid item>
        <Typography variant="h5" maxWidth="80vw" overflow="auto">
          {peer.id}
        </Typography>
      </Grid>
      <Grid item>
        <Grid container direction="row" spacing={2}>
          <Grid item>
            <Confirm
              optimistic={false}
              onYes={async () => {
                await peer.remove()
                sync?.emit(`disconnect`, peer.id)
                navigate(-1)
              }}
              description="Synchronization to this peer will be disabled. Are you sure?"
              title="Delete peer"
              buttonText="delete"
            />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  )
}
