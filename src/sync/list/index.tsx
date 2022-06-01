import {
  Card,
  CardActionArea,
  CardContent,
  Grid,
  Typography,
} from '@mui/material'
import { QRCodeSVG } from 'qrcode.react'
import { FC, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { CenterRow, Loading, PlaceHolder } from '../../common'
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
  return peers ? (
    peers.length ? (
      <Grid
        container
        direction="row"
        justifyContent="start"
        spacing={3}
        flexGrow={1}
      >
        {peers.map(peer => (
          <Grid item key={peer.id}>
            <Card sx={{ minWidth: 180 }}>
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
    ) : (
      <Grid container direction="column" spacing={5}>
        <Grid item>
          <PlaceHolder
            entityName="peer"
            collectionName="peers list"
            link="create"
          />
        </Grid>
        {sync && (
          <Grid item>
            <CenterRow>
              <QRCodeSVG
                value={sync?.id}
                imageSettings={{
                  src: `https://cdn-icons-png.flaticon.com/512/1621/1621635.png`,
                  width: 20,
                  height: 20,

                  excavate: true,
                }}
              />
            </CenterRow>
          </Grid>
        )}
      </Grid>
    )
  ) : (
    <Loading />
  )
}
