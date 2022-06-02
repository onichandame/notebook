import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from '@mui/material'
import { FC, useState } from 'react'

export const Confirm: FC<{
  optimistic?: boolean
  buttonText: string
  title: string
  description: string
  onYes: () => Promise<void> | void
}> = ({ optimistic, title, description, onYes, buttonText }) => {
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button
        variant="contained"
        onClick={() => {
          setOpen(true)
        }}
      >
        {buttonText}
      </Button>
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
            color={optimistic ? `primary` : 'warning'}
          >
            yes
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}
