import { FC } from "react";
import { Route, Routes } from "react-router-dom";

import { CenterRow } from "../common";
import { Create } from "./create";
import { Item } from "./item";
import { List } from "./list";

export const Password: FC = () => {
  return (
    <>
      <Routes>
        <Route path="/" element={<List />} />
        <Route path="/:id/*" element={<Item />} />
        <Route
          path="create"
          element={
            <CenterRow>
              <Create />
            </CenterRow>
          }
        />
      </Routes>
    </>
  );
};
