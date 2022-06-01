import { Typography } from "@mui/material";
import { FC } from "react";
import { Link } from "react-router-dom";

export const PlaceHolder: FC<{
  entityName: string;
  link: string;
  collectionName?: string;
}> = ({ entityName, link, collectionName }) => {
  return (
    <Typography variant="h5">
      Your {collectionName || entityName} is empty,{" "}
      {<Link to={link}>click</Link>} to add your first {entityName}!
    </Typography>
  );
};
