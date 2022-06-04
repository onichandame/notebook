import { Typography } from '@mui/material'
import { FC } from 'react'

export const Title: FC = ({ children }) => {
  return <Typography variant="h3">{children}</Typography>
}
