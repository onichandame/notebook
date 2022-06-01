import { SnackbarProvider } from 'notistack'
import { FC } from 'react'
import { DbProvider } from './db'
import { SyncProvider } from './synchronizer'

export const Global: FC = ({ children }) => {
  return (
    <SnackbarProvider maxSnack={3}>
      <DbProvider>
        <SyncProvider>{children}</SyncProvider>
      </DbProvider>
    </SnackbarProvider>
  )
}
