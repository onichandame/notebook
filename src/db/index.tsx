import { addCollection, ReturnCollectionType } from "@onichandame/type-rxdb";
import { useSnackbar } from "notistack";
import { createContext, FC, useContext, useEffect, useState } from "react";
import { addRxPlugin, createRxDatabase, RxDatabase } from "rxdb";
import { addPouchPlugin, getRxStoragePouch } from "rxdb/plugins/pouchdb";
import { RxDBMigrationPlugin } from "rxdb/plugins/migration";
import { RxDBQueryBuilderPlugin } from "rxdb/plugins/query-builder";
import { RxDBDevModePlugin } from "rxdb/plugins/dev-mode";
import * as pai from "pouchdb-adapter-idb";

import { Note, Password } from "../model";
import { formatError } from "../util";

type Collections = {
  notes: ReturnCollectionType<typeof Note>;
  passwords: ReturnCollectionType<typeof Password>;
};

export type Database = RxDatabase<Collections>;

addPouchPlugin(pai);

addRxPlugin(RxDBDevModePlugin);
addRxPlugin(RxDBMigrationPlugin);
addRxPlugin(RxDBQueryBuilderPlugin);

const DbContext = createContext<Database | null>(null);

export const DbProvider: FC = ({ children }) => {
  const [db, setDb] = useState<Database | null>(null);
  const { enqueueSnackbar } = useSnackbar();
  useEffect(() => {
    let active = true;
    (async () => {
      const db = await createRxDatabase<Collections>({
        name: `my_note`,
        storage: getRxStoragePouch("idb", { auto_compaction: true }),
      });
      await addCollection(db, Note);
      await addCollection(db, Password);
      if (active) {
        setDb(db);
      }
    })().catch((e) => enqueueSnackbar(formatError(e), { variant: `error` }));
    return () => {
      active = false;
    };
  }, []);
  return <DbContext.Provider value={db}>{children}</DbContext.Provider>;
};

export const useDb = () => useContext(DbContext);
