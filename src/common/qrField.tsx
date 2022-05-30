import { QrCode } from "@mui/icons-material";
import { IconButton, Modal } from "@mui/material";
import { FC, useState } from "react";
import QrReader from "react-qr-barcode-scanner";

import { CenterRow } from "./center";

export const QrField: FC<Props> = ({ onConfirm }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <IconButton onClick={() => setOpen(true)}>
        <QrCode />
      </IconButton>
      <CenterRow>
        <Modal
          open={open}
          onClose={() => setOpen(false)}
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div>
            <CenterRow>
              <QrReader
                delay={100}
                onUpdate={(_, res) => {
                  if (res) {
                    console.log(res);
                    onConfirm(res.getText());
                    setOpen(false);
                  }
                }}
              />
            </CenterRow>
          </div>
        </Modal>
      </CenterRow>
    </>
  );
};

type Props = { onConfirm: (_: string) => void };
