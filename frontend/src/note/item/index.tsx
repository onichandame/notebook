import { DocumentType } from "@onichandame/type-rxdb";
import { FC, useEffect, useState } from "react";
import { Route, Routes, useParams } from "react-router-dom";

import { Exception, Loading } from "../../common";
import { useDb } from "../../db";
import { Note } from "../../model";
import { formatError } from "../../util";
import { Detail } from "./detail";
import { Update } from "./update";

export const Item: FC = () => {
  const [err, setErr] = useState<unknown>(null);
  const [note, setNote] = useState<DocumentType<typeof Note> | null>(null);
  const db = useDb();
  const params = useParams();
  useEffect(() => {
    let active = true;
    (async () => {
      if (db) {
        try {
          const id = params.id;
          if (!id) throw new Error(`id must not be empty`);
          const note = await db.notes.findOne().where(`id`).eq(id).where(
            `deletedAt`,
          )
            .exists(false).exec();
          if (!note) throw new Error(`note ${id} not found`);
          if (active) setNote(note);
        } catch (e) {
          if (active) {
            setErr(e);
          }
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [db]);
  return err
    ? <Exception code={404} message={formatError(err)} />
    : note
    ? (
      <Routes>
        <Route path="/" element={<Detail note={note} />} />
        <Route path="update" element={<Update note={note} />} />
      </Routes>
    )
    : <Loading />;
};
