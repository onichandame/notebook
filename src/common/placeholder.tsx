import { Typography } from '@mui/material'
import { FC } from 'react'

export const PlaceHolder: FC = ({ children }) => {
  return <Typography variant="h5">{children}</Typography>
}
