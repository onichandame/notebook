import { FC } from "react";
import { Box, Toolbar } from "@mui/material";
import { Route, Routes } from "react-router-dom";

import { TopBar } from "./topbar";
import { Note } from "./note";
import { Sync } from "./sync";
import { Home } from "./home";
import { Password } from "./password";

export const App: FC = () => {
  return (
    <div>
      <TopBar />
      <Toolbar />
      <main>
        <Box sx={{ p: 2, width: `auto` }}>
          <Routes>
            <Route path="notes/*" element={<Note />} />
            <Route path="passwords/*" element={<Password />} />
            <Route path="sync/*" element={<Sync />} />
            <Route path="/" element={<Home />} />
          </Routes>
        </Box>
      </main>
    </div>
  );
};
