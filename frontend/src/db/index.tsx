import { addCollection, ReturnCollectionType } from "@onichandame/type-rxdb";
import { useSnackbar } from "notistack";
import { createContext, FC, useContext, useEffect, useState } from "react";
import { addRxPlugin, createRxDatabase, RxDatabase } from "rxdb";
import { addPouchPlugin, getRxStoragePouch } from "rxdb/plugins/pouchdb";
import { RxDBMigrationPlugin } from "rxdb/plugins/migration";
import { RxDBQueryBuilderPlugin } from "rxdb/plugins/query-builder";

import { Note } from "../model";
import { formatError } from "../util";

type Collections = { notes: ReturnCollectionType<typeof Note> };

type Database = RxDatabase<Collections>;

addPouchPlugin(await import(`pouchdb-adapter-idb`));

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
        storage: getRxStoragePouch("idb"),
      });
      await addCollection(db, Note);
      if (active) {
        setDb(db);
      }
    })().catch((e) => enqueueSnackbar(formatError(e), { variant: `error` }));
    return () => {
      active = false;
    };
  }, []);
  return (
    <DbContext.Provider value={db}>
      {children}
    </DbContext.Provider>
  );
};

export const useDb = () => useContext(DbContext);
