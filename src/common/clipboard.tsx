import { ContentCopy } from "@mui/icons-material";
import { IconButton } from "@mui/material";
import { useSnackbar } from "notistack";
import { FC } from "react";

/** A button which writes text to clipboard */
export const Clipboard: FC<{ value: string }> = ({ value }) => {
  const { enqueueSnackbar } = useSnackbar();
  return (
    <IconButton
      onClick={(e) => {
        e.stopPropagation();
        navigator.clipboard.writeText(value);
        enqueueSnackbar(`copied to clipboard`, { variant: `success` });
      }}
    >
      <ContentCopy />
    </IconButton>
  );
};
