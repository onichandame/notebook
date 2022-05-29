import { classValidatorResolver } from "@hookform/resolvers/class-validator";
import { Button, Grid, IconButton, TextField } from "@mui/material";
import { IsString } from "class-validator";
import { useSnackbar } from "notistack";
import Peer from "peerjs";
import { QRCodeSVG } from "qrcode.react";
import { FC, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { CenterRow, Loading } from "../common";
import { QrField } from "../common/qrField";

class PeerForm {
  @IsString()
  id!: string;
}
const resolver = classValidatorResolver(PeerForm);

export const Sync: FC = () => {
  const [peer, setPeer] = useState<Peer | null>(null);
  const [handshaking, setHandshaking] = useState(false);
  const { enqueueSnackbar } = useSnackbar();
  const {
    handleSubmit,
    register,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<PeerForm>({ resolver });
  useEffect(() => {
    const peer = new Peer(window.crypto.randomUUID(), {
      host: `peerjs-server-xiao.herokuapp.com`,
      port: 443,
    });
    setPeer(peer);
    return () => {
      peer.destroy();
    };
  }, []);
  return peer
    ? (
      <CenterRow>
        <Grid container direction="column" spacing={5} alignItems="center">
          <Grid item>
            <IconButton
              onClick={() => {
                navigator.clipboard.writeText(peer.id);
                enqueueSnackbar(`id copied to clipboard`, {
                  variant: `success`,
                });
              }}
            >
              <QRCodeSVG
                value={peer.id}
                imageSettings={{
                  src:
                    `https://cdn-icons-png.flaticon.com/512/1621/1621635.png`,
                  height: 20,
                  width: 20,
                  excavate: true,
                }}
              />
            </IconButton>
          </Grid>
          <Grid item>
            <form
              onSubmit={handleSubmit(async (vals) => {
                const conn = peer?.connect(vals.id);
                conn?.on(`open`, () => {
                  console.log(`conned`);
                });
                peer?.on(`connection`, (conn) => {
                  conn.on(`data`, (data) => {});
                });
              })}
            >
              <Grid
                container
                direction="column"
                spacing={3}
                alignItems="center"
              >
                <Grid item>
                  <Grid container direction="row" alignItems="center">
                    <Grid item>
                      <TextField
                        label="Enter Peer ID"
                        error={!!errors.id}
                        helperText={errors.id?.message}
                        InputLabelProps={{ shrink: true }}
                        {...register(`id`)}
                      />
                    </Grid>
                    <Grid item>
                      <QrField onConfirm={(v) => setValue(`id`, v)} />
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item>
                  <Button variant="contained" type="submit">sync</Button>
                </Grid>
              </Grid>
            </form>
          </Grid>
        </Grid>
      </CenterRow>
    )
    : <Loading />;
};
