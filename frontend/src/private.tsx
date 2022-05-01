import { FC } from "react";
import { useLocation, Routes, Route, Navigate } from "react-router-dom";

import { Home } from "./home";
import { useUser } from "./backend";
import { Notes } from "./notes";
import { Settings } from "./settings";

export const Private: FC = () => {
  const user = useUser();
  const location = useLocation();
  return user ? (
    <Routes>
      <Route path="notes/*" element={<Notes />} />
      <Route path="settings/*" element={<Settings />} />
      <Route path="/" element={<Home />} />
    </Routes>
  ) : (
    <Navigate
      to={`/login?redirect=${encodeURIComponent(
        location.pathname + location.search + location.hash
      )}`}
    />
  );
};