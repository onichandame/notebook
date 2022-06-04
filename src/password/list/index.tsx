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
import { DocumentType } from '@onichandame/type-rxdb'
import { FC, useCallback, useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

import { Actions } from '../../actions'
import { CenterRow, Exception, Loading, PlaceHolder } from '../../common'
import { useDb } from '../../db'
import { Password } from '../../model'
import { formatError } from '../../util'

export const List: FC = () => {
  const [pwds, setPwds] = useState<DocumentType<typeof Password>[] | null>(null)
  const [err, setErr] = useState<unknown>(null)
  const navigate = useNavigate()
  const db = useDb()
  const updatePwds = useCallback(async () => {
    try {
      const pwds = await db?.passwords
        .find()
        .sort({ createdAt: `asc` })
        .where(`deletedAt`)
        .exists(false)
        .exec()
      if (pwds) {
        setPwds(pwds)
      }
    } catch (e) {
      setErr(e)
    }
  }, [db])
  useEffect(() => {
    updatePwds()
  }, [updatePwds])
  return err ? (
    <Exception message={formatError(err)} />
  ) : pwds ? (
    pwds.length ? (
      <>
        <Grid
          container
          direction="row"
          spacing={3}
          justifyContent="start"
          flexGrow={1}
        >
          {pwds.map(pwd => (
            <Grid item key={pwd.id}>
              <Card sx={{ minWidth: 180 }}>
                <CardActionArea
                  onClick={() => {
                    navigate(pwd.id.toString())
                  }}
                >
                  <CardMedia
                    component="img"
                    height="150"
                    image={
                      pwd.icon ||
                      'https://media.wired.com/photos/5926e34f8d4ebc5ab806bd1c/master/pass/GettyImages-528338761.jpg'
                    }
                    alt={pwd.title}
                  />
                  <CardContent>
                    <Typography variant="h5" align="center">
                      {pwd.title}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
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
      <CenterRow>
        <PlaceHolder>
          <Link to="create">Save your first password!</Link>
        </PlaceHolder>
      </CenterRow>
    )
  ) : (
    <Loading />
  )
}
