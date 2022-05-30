import { NavigateNext } from "@mui/icons-material";
import { Breadcrumbs, Typography } from "@mui/material";
import { FC } from "react";
import { Link, Route, Routes } from "react-router-dom";

import { Path, root } from "./path";

export const Title: FC = () => {
  return (
    <Routes>
      {root.toList().map((v) => {
        const chain: Path[] = [];
        const populateChain = (p: Path) => {
          chain.unshift(p);
          if (p.parent) populateChain(p.parent);
        };
        populateChain(v);
        return (
          <Route
            key={v.title}
            path={v.match}
            element={
              <Breadcrumbs separator={<NavigateNext />}>
                {chain.map((v) => (
                  <Typography variant="h6" key={v.title}>
                    <Link
                      to={v.link}
                      style={{ textDecoration: `none`, color: `inherit` }}
                    >
                      {v.title}
                    </Link>
                  </Typography>
                ))}
              </Breadcrumbs>
            }
          />
        );
      })}
    </Routes>
  );
};
