import { Menu } from "@mui/icons-material";
import { AppBar, IconButton, Toolbar, Typography } from "@mui/material";
import { FC, useState } from "react";

import { Sidebar } from "./sidebar";
import { Title } from "./title";

export const TopBar: FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <>
      <AppBar>
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            sx={{ mr: 2 }}
            onClick={() => setSidebarOpen(true)}
          >
            <Menu />
          </IconButton>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            <Title />
          </Typography>
        </Toolbar>
      </AppBar>
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
    </>
  );
};
