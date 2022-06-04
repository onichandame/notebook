import { Button } from '@mui/material'
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
      Synchronizer.create(db)
        .then(sync => {
          if (active) setSync(sync)
        })
        .catch(e => {
          console.error(e)
          enqueueSnackbar(formatError(e), { variant: `error` })
        })
    }
    return () => {
      active = false
    }
  }, [db, setSync])
  useEffect(() => {
    if (sync) {
      ;(async () => {
        for await (const event of sync) {
          switch (event.type) {
            case `peer:handshake`: {
              const key = enqueueSnackbar(
                `received handshake request from ${event.peerId.slice(-5)}`,
                {
                  variant: `info`,
                  action: (
                    <Button
                      onClick={async () => {
                        closeSnackbar(key)
                        sync.acceptHandshake(event.peerId)
                      }}
                    >
                      accept
                    </Button>
                  ),
                  onClose: (_, reason) => {
                    switch (reason) {
                      case `maxsnack`:
                      case `timeout`:
                        sync.denyHandshake(event.peerId)
                        break
                    }
                  },
                }
              )
              break
            }
            case `peer:connect`: {
              enqueueSnackbar(
                `connected to peer ${
                  (
                    await db?.peers
                      .findOne()
                      .where(`id`)
                      .eq(event.peerId)
                      .exec()
                  )?.name
                }`,
                {
                  variant: `success`,
                }
              )
              break
            }
            case `peer:disconnect`: {
              enqueueSnackbar(
                `disconnected from peer ${
                  (
                    await db?.peers
                      .findOne()
                      .where(`id`)
                      .eq(event.peerId)
                      .exec()
                  )?.name
                }`,
                {
                  variant: `warning`,
                }
              )
              break
            }
          }
        }
      })()
    }
    return () => {
      sync?.destroy()
    }
  }, [sync])
  return <SyncContext.Provider value={sync}>{children}</SyncContext.Provider>
}

export const useSync = () => useContext(SyncContext)
