import {
  Card,
  CardActionArea,
  CardContent,
  Grid,
  Typography,
} from '@mui/material'
import { FC, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { Loading, PlaceHolder } from '../../../common'
import { useDb } from '../../../db'
import { Peer } from '../../../model'
import { useSync } from '../../../synchronizer'

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
        <>
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
        </>
      ) : (
        <Grid item>
          <PlaceHolder>
            <Link to="create">Create a peer</Link>
          </PlaceHolder>
        </Grid>
      )}
    </Grid>
  ) : (
    <Loading />
  )
}
