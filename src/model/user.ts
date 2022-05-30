import { IsEmail, IsString, IsUrl } from "class-validator";

import {
  IsEqualToField,
  PasswordValidator,
  UsernameValidator,
  ValidateIfNotEmpty,
} from "../common";
import { Base } from "./base";

export class User extends Base {
  name!: string;
  email?: string;
  avatar?: string;
  static get fields(): string[] {
    return super.fields.concat([`name`, `email`, `avatar`] as (keyof User)[]);
  }
}

export class CreateUserInput {
  @UsernameValidator()
  name!: string;
  @PasswordValidator()
  password!: string;
  @ValidateIfNotEmpty()
  @IsString()
  @IsEmail()
  email?: string;
  @ValidateIfNotEmpty()
  @IsString()
  @IsUrl()
  avatar?: string;
}

export class UpdateUserInput {
  @ValidateIfNotEmpty()
  @UsernameValidator()
  name?: string;
  @ValidateIfNotEmpty()
  @PasswordValidator()
  password?: string;
  @ValidateIfNotEmpty()
  @IsString()
  @IsEmail()
  email?: string;
  @ValidateIfNotEmpty()
  @IsString()
  @IsUrl()
  avatar?: string;
}

export class CreateUserForm extends CreateUserInput {
  @PasswordValidator()
  @IsEqualToField<CreateUserForm>(`password`)
  password2!: string;
}
