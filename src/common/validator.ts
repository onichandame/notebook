import {
  IsString,
  Length,
  registerDecorator,
  ValidateIf,
  ValidationOptions,
  ValidatorOptions,
} from "class-validator";

export const ValidateIfNotEmpty = (opts?: ValidatorOptions) => {
  return ValidateIf((_, v) => !!v, opts);
};

export const IsEqualToField = <T extends object>(
  field: keyof T,
  opts?: ValidationOptions
) => {
  return function (target, key) {
    registerDecorator({
      name: `isEqualToField`,
      target: target.constructor,
      propertyName: key as string,
      constraints: [field],
      options: opts,
      validator: {
        validate(value, args) {
          return (
            !!args?.constraints &&
            value === (args?.object as any)[args.constraints[0]]
          );
        },
        defaultMessage(args) {
          return `value does not match ${args?.constraints[0]}`;
        },
      },
    });
  } as PropertyDecorator;
};

export const UsernameValidator = () => {
  return function (target, key) {
    IsString()(target, key);
    Length(4, 20)(target, key);
  } as PropertyDecorator;
};

export const PasswordValidator = () => {
  return function (target, key) {
    IsString()(target, key);
    Length(6, 40)(target, key);
  } as PropertyDecorator;
};
