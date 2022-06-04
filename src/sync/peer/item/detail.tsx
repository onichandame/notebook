import {
  Avatar,
  Button,
  Grid,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material'
import { DocumentType } from '@onichandame/type-rxdb'
import { FC } from 'react'
import { useNavigate } from 'react-router-dom'

import { Clipboard, Confirm } from '../../../common'
import { Peer } from '../../../model'
import { useSync } from '../../../synchronizer'

export const Detail: FC<{ peer: DocumentType<typeof Peer> }> = ({ peer }) => {
  const navigate = useNavigate()
  const sync = useSync()
  return (
    <Grid container direction="column" alignItems="center" spacing={5}>
      <Grid item>
        <Grid container direction="row" spacing={2} alignItems="center">
          <Grid item>
            <Avatar alt={peer.name} src={peer.icon} />
          </Grid>
          <Grid item>
            <Typography variant="h5" maxWidth="80vw" overflow="auto">
              {peer.name}
            </Typography>
          </Grid>
        </Grid>
      </Grid>
      <Grid item>
        <TextField
          label="ID"
          value={peer.id}
          variant="filled"
          InputProps={{
            readOnly: true,
            disableUnderline: true,
            endAdornment: (
              <InputAdornment position="end">
                <Clipboard value={peer.id} />
              </InputAdornment>
            ),
          }}
          InputLabelProps={{ shrink: true }}
        />
      </Grid>
      <Grid item>
        <Grid container direction="row" spacing={2}>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              onClick={() => {
                navigate(`update`)
              }}
            >
              edit
            </Button>
          </Grid>
          <Grid item>
            <Confirm
              optimistic={false}
              onYes={async () => {
                await peer.remove()
                sync?.disconnectFromPeer(peer.id)
                navigate(-1)
              }}
              color="secondary"
              description="Synchronization to this peer will be disabled. Are you sure?"
              title="Delete peer"
            >
              delete
            </Confirm>
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  )
}
