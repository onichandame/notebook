import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material'
import { ComponentProps, FC, useState } from 'react'

type Props = {
  optimistic?: boolean
  title: string
  description: string
  onYes: () => Promise<void> | void
} & ComponentProps<typeof Button>

export const Confirm: FC<Props> = ({
  optimistic,
  title,
  description,
  onYes,
  ...other
}) => {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button
        {...other}
        variant="contained"
        onClick={() => {
          setOpen(true)
        }}
      />
      <Dialog
        open={open}
        onClose={() => {
          setOpen(false)
        }}
      >
        <DialogTitle>{title}</DialogTitle>
        <DialogContent>
          <DialogContentText>{description}</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpen(false)
            }}
            color={optimistic ? `secondary` : `primary`}
          >
            no
          </Button>
          <Button
            onClick={async () => {
              await onYes()
              setOpen(false)
            }}
            color={optimistic ? `primary` : 'secondary'}
          >
            yes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
