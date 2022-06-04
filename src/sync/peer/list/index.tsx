import { Add } from '@mui/icons-material'
import {
  Card,
  CardActionArea,
  CardContent,
  CardMedia,
  Grid,
  SpeedDialAction,
  Typography,
} from '@mui/material'
import { FC, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Actions } from '../../../actions'

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
    <>
      <Grid container direction="column" spacing={5}>
        {peers.length ? (
          <>
            <Grid item>
              <Grid
                container
                direction="row"
                justifyContent="start"
                alignItems="stretch"
                spacing={3}
                flexGrow={1}
              >
                {peers.map(peer => (
                  <Grid item key={peer.id} sx={{ display: `flex` }}>
                    <Card sx={{ width: 180 }}>
                      <CardActionArea onClick={() => navigate(peer.id)}>
                        <CardMedia
                          component="img"
                          height="150"
                          image={
                            peer.icon ||
                            'https://cdn2.iconfinder.com/data/icons/sync-and-data-exchange/64/PC-Sync-512.png'
                          }
                          alt={peer.name}
                        />
                        <CardContent>
                          <Typography variant="h5" align="center">
                            {peer.name}
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
      <Actions>
        <SpeedDialAction
          icon={<Add />}
          tooltipTitle="Create"
          onClick={() => {
            navigate(`create`)
          }}
        />
      </Actions>
    </>
  ) : (
    <Loading />
  )
}
