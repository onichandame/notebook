import { Add } from "@mui/icons-material";
import {
  Card,
  CardActionArea,
  CardContent,
  CardHeader,
  Grid,
  SpeedDialAction,
  Typography,
} from "@mui/material";
import { DocumentType } from "@onichandame/type-rxdb";
import { FC, useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Actions } from "../../actions";
import { Loading } from "../../common";
import { useDb } from "../../db";
import { Note } from "../../model";

export const List: FC = () => {
  const [notes, setNotes] = useState<DocumentType<typeof Note>[] | null>(null);
  const navigate = useNavigate();
  const db = useDb();
  const updateList = useCallback(async () => {
    const notes = await db?.notes.find().where(`deletedAt`).exists(false)
      .exec();
    if (notes) {
      setNotes(notes);
    }
  }, [db]);
  useEffect(() => {
    updateList();
  }, [updateList]);
  return notes
    ? (
      notes.length
        ? (
          <>
            <Grid
              container
              direction="row"
              spacing={3}
              justifyContent="start"
              flexGrow={1}
            >
              {notes.map((note) => (
                <Grid item key={`note${note.id}`}>
                  <Card sx={{ minWidth: 180 }} variant="outlined">
                    <CardActionArea
                      onClick={() => {
                        navigate(note.id.toString());
                      }}
                    >
                      <CardHeader
                        title={note.title}
                        subheader={new Date(note.createdAt)
                          .toLocaleDateString()}
                      />
                      <CardContent>
                        <Typography>
                          {note.content && (note.content.length < 10
                            ? note.content
                            : `${note.content.slice(0, 7)}...`)}
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
                  navigate(`create`);
                }}
              />
            </Actions>
          </>
        )
        : (
          <Typography variant="h5">
            you don't have any notes here,{" "}
            <Link to="create">create one now</Link>!
          </Typography>
        )
    )
    : <Loading />;
};
