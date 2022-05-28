import "./polyfill";
import { CssBaseline } from "@mui/material";
import React from "react";
import ReactDOM from "react-dom";
import { BrowserRouter } from "react-router-dom";

import { App } from "./App";
import { Global } from "./global";

ReactDOM.render(
  <React.StrictMode>
    <CssBaseline />
    <BrowserRouter>
      <Global>
        <App />
      </Global>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById("root"),
);
