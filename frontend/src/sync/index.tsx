import { classValidatorResolver } from "@hookform/resolvers/class-validator";
import { Button, Grid, TextField } from "@mui/material";
import { IsString } from "class-validator";
import Peer from "peerjs";
import { FC, useEffect, useState } from "react";
import { useForm } from "react-hook-form";

import { CenterRow } from "../common";

class PeerForm {
  @IsString()
  id!: string;
}
const resolver = classValidatorResolver(PeerForm);

export const Sync: FC = () => {
  const [peer, setPeer] = useState<Peer | null>(null);
  const { handleSubmit, register, formState: { errors, isSubmitting } } =
    useForm<PeerForm>({ resolver });
  useEffect(() => {
    const peer = new Peer(window.crypto.randomUUID(), {
      host: `peerjs-server-xiao.herokuapp.com`,
      port: 443,
    });
    setPeer(peer);
    peer.on(`connection`, (conn) => {
      console.log(conn);
    });
    return () => {
      peer.destroy();
    };
  }, []);
  return (
    <CenterRow>
      <Grid container direction="column" spacing={5} alignItems="center">
        <Grid item>
          <Grid container direction="row" alignItems="center">
            <Grid item>
              {peer && peer?.id}
            </Grid>
            <Grid item>
              <Button
                size="small"
                disabled={!peer}
                onClick={() => {
                  if (peer?.id) {
                    navigator.clipboard.writeText(peer.id);
                  }
                }}
              >
                copy
              </Button>
            </Grid>
          </Grid>
        </Grid>
        <Grid item>
          <form
            onSubmit={handleSubmit(async (vals) => {
              const conn = peer?.connect(vals.id);
              conn?.on(`open`, () => {
                console.log(`conned`);
              });
            })}
          >
            <Grid container direction="row" spacing={3} alignItems="center">
              <Grid item>
                <TextField
                  label="Enter Peer ID"
                  error={!!errors.id}
                  helperText={errors.id?.message}
                  {...register(`id`)}
                />
              </Grid>
              <Grid item>
                <Button variant="contained" type="submit">sync</Button>
              </Grid>
            </Grid>
          </form>
        </Grid>
      </Grid>
    </CenterRow>
  );
};
