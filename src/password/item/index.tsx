import { DocumentType } from "@onichandame/type-rxdb";
import { FC, useCallback, useEffect, useState } from "react";
import { Route, Routes, useParams } from "react-router-dom";

import { Exception, Loading } from "../../common";
import { useDb } from "../../db";
import { Password } from "../../model";
import { formatError } from "../../util";
import { Detail } from "./detail";
import { Update } from "./update";

export const Item: FC = () => {
  const db = useDb();
  const params = useParams();
  const [pwd, setPwd] = useState<DocumentType<typeof Password> | null>(null);
  const [err, setErr] = useState<unknown>(null);
  const updatePwd = useCallback(async () => {
    if (db) {
      try {
        if (!params.id) throw new Error(`id must not be empty`);
        const pwd = (
          await db.passwords.findOne().where(`id`).eq(params.id).where(
            `deletedAt`,
          ).exists(false).exec()
        );
        if (!pwd) throw new Error(`password ${params.id} not found`);
        setPwd(pwd);
      } catch (e) {
        setErr(e);
      }
    }
  }, [db, params]);
  useEffect(() => {
    updatePwd();
  }, [updatePwd]);
  return err
    ? <Exception code={404} message={formatError(err)} />
    : pwd
    ? (
      <Routes>
        <Route path="/update" element={<Update pwd={pwd} />} />
        <Route path="/" element={<Detail pwd={pwd} />} />
      </Routes>
    )
    : <Loading />;
};
