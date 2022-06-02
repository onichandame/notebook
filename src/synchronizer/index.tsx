import { Button } from '@mui/material'
import { pipe } from 'it-pipe'
import { useSnackbar } from 'notistack'
import {
  ContextType,
  createContext,
  FC,
  useContext,
  useEffect,
  useState,
} from 'react'

import { useDb } from '../db'
import { formatError } from '../util'
import { Synchronizer } from './synchronizer'

const SyncContext = createContext<Synchronizer | null>(null)

export const SyncProvider: FC = ({ children }) => {
  const db = useDb()
  const { enqueueSnackbar, closeSnackbar } = useSnackbar()
  const [sync, setSync] = useState<ContextType<typeof SyncContext>>(null)
  useEffect(() => {
    let active = true
    if (db) {
      Synchronizer.create(db).then(sync => {
        if (active) setSync(sync)
      })
    }
    return () => {
      active = false
    }
  }, [db, setSync])
  useEffect(() => {
    sync?.on(`handshake:init`, e => {
      const key = enqueueSnackbar(
        `received handshake request from ${e.connection.remotePeer.toString()}`,
        {
          action: (
            <Button
              onClick={async () => {
                closeSnackbar(key)
                await db?.peers.insert({
                  id: e.connection.remotePeer.toString(),
                })
                await pipe(function* () {
                  yield new TextEncoder().encode(`OK`)
                }, e.stream.sink)
              }}
            >
              accept
            </Button>
          ),
          onClose: (_, reason) => {
            switch (reason) {
              case `maxsnack`:
              case `timeout`:
                e.connection.close()
                break
            }
          },
        }
      )
    })
    db?.peers
      .find()
      .exec()
      .then(peers =>
        Promise.all(
          peers.map(peer =>
            sync?.connectToPeer(peer).catch(e => {
              enqueueSnackbar(formatError(e), { variant: `error` })
              console.log(e)
            })
          )
        )
      )
    return () => {
      sync?.destroy()
    }
  }, [sync])
  return <SyncContext.Provider value={sync}>{children}</SyncContext.Provider>
}

export const useSync = () => useContext(SyncContext)
