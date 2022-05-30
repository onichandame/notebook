import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";
import { DocumentType } from "@onichandame/type-rxdb";
import { useSnackbar } from "notistack";
import { FC, useState } from "react";
import { useNavigate } from "react-router-dom";

import { Password } from "../../../model";
import { formatError } from "../../../util";

export const Delete: FC<{ pwd: DocumentType<typeof Password> }> = ({ pwd }) => {
  const [deleting, setDeleting] = useState(false);
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  return (
    <>
      <Button
        fullWidth
        color="secondary"
        variant="contained"
        onClick={() => {
          setDeleting(true);
        }}
      >
        delete
      </Button>
      <Dialog open={deleting} onClose={() => setDeleting(false)}>
        <DialogTitle>Delete Password</DialogTitle>
        <DialogContent>
          <DialogContentText>Are you sure?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleting(false)}>no</Button>
          <Button
            color="secondary"
            onClick={async () => {
              try {
                await pwd.atomicPatch({ deletedAt: new Date() });
                setDeleting(false);
                navigate(-1);
              } catch (e) {
                enqueueSnackbar(formatError(e), { variant: `error` });
              }
            }}
          >
            yes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
