import {
  ContextType,
  createContext,
  FC,
  useContext,
  useEffect,
  useState,
} from 'react'

import { useDb } from '../db'
import { Synchronizer } from './synchronizer'

const SyncContext = createContext<Synchronizer | null>(null)

export const SyncProvider: FC = ({ children }) => {
  const db = useDb()
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
    return () => {
      sync?.destroy()
    }
  }, [sync])
  return <SyncContext.Provider value={sync}>{children}</SyncContext.Provider>
}

export const useSync = () => useContext(SyncContext)
