import { Button, Grid, Typography } from "@mui/material";
import { FC } from "react";
import { useNavigate } from "react-router-dom";

import ReactMarkdown from "react-markdown";
import { DocumentType } from "@onichandame/type-rxdb";
import { Delete } from "./delete";

import { Note } from "../../../model";

export const Detail: FC<{ note: DocumentType<typeof Note> }> = ({ note }) => {
  const navigate = useNavigate();
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
                    navigate(`update`);
                  }}
                >
                  edit
                </Button>
              </Grid>
              <Grid item>
                <Delete note={note} />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>
      <Grid item>
        {note.content &&
          <ReactMarkdown>{note.content}</ReactMarkdown>}
      </Grid>
    </Grid>
  );
};
