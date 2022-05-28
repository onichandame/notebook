import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { DocumentType } from "@onichandame/type-rxdb";
import { FC, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Note } from "../../model";

export const Delete: FC<{ note: DocumentType<typeof Note> }> = ({ note }) => {
  const navigate = useNavigate();
  const [deleting, setDeleting] = useState(false);
  return (
    <>
      <Button
        variant="contained"
        color="secondary"
        onClick={() => {
          setDeleting(true);
        }}
      >
        delete
      </Button>
      <Dialog
        open={deleting}
        onClose={() => {
          setDeleting(false);
        }}
      >
        <DialogTitle>Delete Note</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setDeleting(false);
            }}
          >
            no
          </Button>
          <Button
            color="secondary"
            onClick={async () => {
              await note.softDelete();
              setDeleting(false);
              navigate(-1);
            }}
          >
            yes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
