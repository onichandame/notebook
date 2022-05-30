import {
  IsBoolean,
  IsDate,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
} from "class-validator";
import { DateFilter, IntFilter, Password, StringFilter } from ".";
import { ValidateIfNotEmpty } from "../common";
import { Owned } from "./base";

export class Peer extends Owned {
  autoSync!: boolean;
  passwordId!: number;
  title!: string;
  icon?: string;

  password?: Password;

  static get fields(): string[] {
    return super.fields.concat([
      `autoSync`,
      `passwordId`,
      `title`,
      `icon`,
      `password{${Password.fields.join(` `)}}`,
    ] as (keyof Peer)[]);
  }
}

export class PeerFilter {
  id?: InstanceType<typeof IntFilter>;
  uuid?: InstanceType<typeof StringFilter>;
  deletedAt?: InstanceType<typeof DateFilter>;
}

export class CreatePeerInput {
  @ValidateIfNotEmpty()
  @IsBoolean()
  autoSync?: boolean;
  @IsString()
  title!: string;
  @IsOptional()
  @IsString()
  icon?: string;
  @IsPositive()
  @IsInt()
  passwordId!: number;
}

export class UpdatePeerInput {
  @ValidateIfNotEmpty()
  @IsBoolean()
  autoSync?: boolean;
  @ValidateIfNotEmpty()
  @IsString()
  title?: string;
  @IsOptional()
  @IsString()
  icon?: string | null;
  @ValidateIfNotEmpty()
  @IsPositive()
  @IsInt()
  passwordId?: number;
  @IsOptional()
  @IsDate()
  deletedAt?: Date;
}
