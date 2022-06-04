import {
  Avatar,
  Button,
  Divider,
  Grid,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material'
import { DocumentType } from '@onichandame/type-rxdb'
import { useSnackbar } from 'notistack'
import { FC } from 'react'
import { useNavigate } from 'react-router-dom'

import { CenterRow, Clipboard, Confirm, Loading } from '../../../common'
import { Password } from '../../../model'
import { useSync } from '../../../synchronizer'
import { formatError } from '../../../util'

export const Detail: FC<{ pwd: DocumentType<typeof Password> }> = ({ pwd }) => {
  const navigate = useNavigate()
  const sync = useSync()
  const { enqueueSnackbar } = useSnackbar()
  return pwd ? (
    <CenterRow>
      <Grid container direction="column" spacing={4} alignItems="stretch">
        <Grid item>
          <CenterRow>
            <Grid container direction="row" spacing={2} alignItems="center">
              <Grid item>
                <Avatar alt={pwd.title} src={pwd.icon} />
              </Grid>
              <Grid item>
                <Typography variant="h3">{pwd.title}</Typography>
              </Grid>
            </Grid>
          </CenterRow>
        </Grid>
        <Grid item>
          <Grid container direction="row" justifyContent="center" spacing={3}>
            <Grid item>
              <Grid
                container
                direction="column"
                border="1px solid"
                borderRadius={2}
                borderColor={theme => theme.palette.divider}
                spacing={1}
              >
                <Grid item>
                  <TextField
                    variant="standard"
                    label="Username"
                    value={pwd.username}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      readOnly: true,
                      disableUnderline: true,
                      endAdornment: pwd.username && (
                        <InputAdornment position="end">
                          <Clipboard value={pwd.username} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Divider />
                <Grid item>
                  <TextField
                    variant="standard"
                    label="Password"
                    value={pwd.password}
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      readOnly: true,
                      disableUnderline: true,
                      endAdornment: pwd.password && (
                        <InputAdornment position="end">
                          <Clipboard value={pwd.password} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>
            <Grid item>
              <Grid
                container
                direction="column"
                border="1px solid"
                borderRadius={2}
                borderColor={theme => theme.palette.divider}
                spacing={1}
              >
                <Grid item>
                  <TextField
                    value={pwd.url}
                    variant="standard"
                    label="Website"
                    fullWidth
                    InputLabelProps={{ shrink: true }}
                    InputProps={{
                      readOnly: true,
                      disableUnderline: true,
                      endAdornment: pwd.url && (
                        <InputAdornment position="end">
                          <Clipboard value={pwd.url} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
        <Grid item>
          <Grid container direction="row" spacing={2} justifyContent="center">
            <Grid item>
              <Button
                fullWidth
                variant="contained"
                onClick={e => {
                  e.stopPropagation()
                  navigate(`./update`)
                }}
              >
                edit
              </Button>
            </Grid>
            <Grid item>
              <Confirm
                color="secondary"
                description="Are you sure?"
                title="Delete password"
                onYes={async () => {
                  try {
                    const doc = await pwd.atomicPatch({
                      updatedAt: new Date(),
                      deletedAt: new Date(),
                    })
                    sync?.update(doc)
                    navigate(-1)
                  } catch (e) {
                    enqueueSnackbar(formatError(e), { variant: `error` })
                  }
                }}
              >
                delete
              </Confirm>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </CenterRow>
  ) : (
    <Loading />
  )
}
