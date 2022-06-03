import { IconButton } from '@mui/material'
import { useSnackbar } from 'notistack'
import { QRCodeCanvas } from 'qrcode.react'
import { FC } from 'react'
import { formatError } from '../util'

export const QrCode: FC<{ value: string }> = ({ value }) => {
  const { enqueueSnackbar } = useSnackbar()
  return (
    <IconButton
      onClick={() => {
        try {
          navigator.clipboard.writeText(value)
          enqueueSnackbar(`copied to clipboard`, { variant: `success` })
        } catch (e) {
          enqueueSnackbar(formatError(e), { variant: `error` })
        }
      }}
    >
      <QRCodeCanvas
        value={value}
        imageSettings={{
          src: `https://cdn-icons-png.flaticon.com/512/1621/1621635.png`,
          width: 20,
          height: 20,
          excavate: true,
        }}
        includeMargin={true}
      />
    </IconButton>
  )
}
