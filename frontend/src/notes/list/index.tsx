import { NoteAdd, Sync } from "@mui/icons-material";
import { Grid, SpeedDialAction } from "@mui/material";
import { FC, useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { Actions } from "../../actions";
import { useService } from "../../backend";
import { Note } from "../../model";
import { Item } from "./item";

export const List: FC = () => {
  const [notes, setNotes] = useState<Note[]>([]);
  const navigate = useNavigate();
  const svc = useService();
  const updateList = useCallback(async () => {
    const notes = await svc.listNotes({ deletedAt: { null: true } });
    setNotes(notes.edges.map((v) => v.node));
  }, [svc]);
  useEffect(() => {
    updateList();
  }, [updateList]);
  return (
    <>
      {notes.length ? (
        <Grid
          container
          direction="row"
          spacing={3}
          justifyContent="start"
          flexGrow={1}
        >
          {notes.map((note) => (
            <Grid item key={`note${note.id}`}>
              <Item item={note} />
            </Grid>
          ))}
        </Grid>
      ) : (
        <div>
          you don't have any notes here, <Link to="create">create one now</Link>
          !
        </div>
      )}
      <Actions>
        <SpeedDialAction
          icon={<NoteAdd />}
          tooltipTitle="Create"
          onClick={() => {
            navigate(`create`);
          }}
        />
        <SpeedDialAction
          icon={<Sync />}
          tooltipTitle="Sync from"
          onClick={() => {
            navigate(`sync`);
          }}
        />
      </Actions>
    </>
  );
};