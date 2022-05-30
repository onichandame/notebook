import {
  Avatar,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  IconButton,
  TextField,
} from "@mui/material";
import { FC, useEffect, useState } from "react";

type Value = string | null;
type Props = {
  /** callback to change the value in form */
  onConfirm: (value: Value) => void;
  /** the value saved in form */
  value: Value;
};

export const IconField: FC<Props> = ({ onConfirm, value }) => {
  const [open, setOpen] = useState(false);
  const [icon, setIcon] = useState<Value>(value);
  useEffect(() => {
    setIcon(value);
  }, [value]);
  return (
    <>
      <IconButton
        onClick={() => {
          setOpen(true);
        }}
      >
        <Avatar src={value || undefined} />
      </IconButton>
      <Dialog
        open={open}
        onClose={() => {
          setOpen(false);
        }}
      >
        <DialogTitle>Change Icon</DialogTitle>
        <DialogContent>
          <Grid container direction="column" alignItems="center" spacing={2}>
            <Grid item>
              <Avatar src={icon || undefined} />
            </Grid>
            <Grid item>
              <TextField
                label="Icon Url"
                variant="filled"
                defaultValue={icon}
                onChange={(e) => {
                  setIcon(e.target.value || null);
                }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpen(false);
            }}
            color="secondary"
          >
            cancel
          </Button>
          <Button
            onClick={() => {
              onConfirm(icon);
              setOpen(false);
            }}
          >
            confirm
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
