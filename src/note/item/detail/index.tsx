import { Button, Grid, Typography } from '@mui/material'
import { FC } from 'react'
import { useNavigate } from 'react-router-dom'

import ReactMarkdown from 'react-markdown'
import { DocumentType } from '@onichandame/type-rxdb'

import { Note } from '../../../model'
import { Confirm } from '../../../common'
import { useSync } from '../../../synchronizer'

export const Detail: FC<{ note: DocumentType<typeof Note> }> = ({ note }) => {
  const navigate = useNavigate()
  const sync = useSync()
  return (
    <Grid container direction="column" spacing={4}>
      <Grid item>
        <Grid
          container
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Grid item>
            <Typography variant="h3">{note.title}</Typography>
          </Grid>
          <Grid item>
            <Grid container direction="row" spacing={2}>
              <Grid item>
                <Button
                  variant="contained"
                  onClick={() => {
                    navigate(`update`)
                  }}
                >
                  edit
                </Button>
              </Grid>
              <Grid item>
                <Confirm
                  title="Delete note"
                  description="Are you sure?"
                  onYes={async () => {
                    const doc = await note.softDelete()
                    sync?.update(doc)
                    navigate(-1)
                  }}
                  color="secondary"
                >
                  delete
                </Confirm>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Grid item>
        {note.content && <ReactMarkdown>{note.content}</ReactMarkdown>}
      </Grid>
    </Grid>
  )
}
