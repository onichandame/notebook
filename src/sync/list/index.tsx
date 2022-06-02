import {
  Card,
  CardActionArea,
  CardContent,
  Grid,
  Typography,
} from '@mui/material'
import { FC, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { CenterRow, Loading, PlaceHolder, QrCode } from '../../common'
import { useDb } from '../../db'
import { Peer } from '../../model'
import { useSync } from '../../synchronizer'

export const List: FC = () => {
  const db = useDb()
  const sync = useSync()
  const [peers, setPeers] = useState<Peer[] | null>(null)
  const navigate = useNavigate()
  useEffect(() => {
    db?.peers
      .find()
      .exec()
      .then(peers => setPeers(peers))
  }, [db])
  return sync && peers ? (
    <Grid container direction="column" spacing={5}>
      {peers.length ? (
        <Grid item>
          <Grid
            container
            direction="row"
            justifyContent="start"
            spacing={3}
            flexGrow={1}
          >
            {peers.map(peer => (
              <Grid item key={peer.id}>
                <Card sx={{ maxWidth: 180 }}>
                  <CardActionArea onClick={() => navigate(peer.id)}>
                    <CardContent>
                      <Typography variant="h5" align="center">
                        {peer.id}
                      </Typography>
                    </CardContent>
                  </CardActionArea>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Grid>
      ) : (
        <Grid item>
          <PlaceHolder
            entityName="peer"
            link="create"
            collectionName="peer list"
          />
        </Grid>
      )}
      <Grid item>
        <Typography variant="h6" maxWidth="80vw" overflow="auto">
          My ID: {sync.id}
        </Typography>
      </Grid>
      <Grid item>
        <Typography variant="h6">My addresses:</Typography>
        <CenterRow>
          <QrCode value={JSON.stringify(sync.multiaddrs)} />
        </CenterRow>
      </Grid>
    </Grid>
  ) : (
    <Loading />
  )
}
