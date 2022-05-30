import {
  IsDate,
  IsNumber,
  IsInt,
  IsArray,
  IsString,
  IsOptional,
  IsBoolean,
} from "class-validator";

const createFilter = <TData>(validator: () => PropertyDecorator) => {
  class Filter {
    @IsOptional()
    @validator()
    eq?: TData;
    @IsOptional()
    @IsBoolean()
    null?: boolean;
    @IsOptional()
    @validator()
    lt?: TData;
    @IsOptional()
    @validator()
    lte?: TData;
    @IsOptional()
    @validator()
    gt?: TData;
    @IsOptional()
    @validator()
    gte?: TData;
    @IsOptional()
    @IsString()
    like?: string;
    @IsOptional()
    @IsArray()
    and?: Filter[];
    @IsOptional()
    @IsArray()
    or?: Filter[];
    @IsOptional()
    @IsBoolean()
    not?: boolean;
  }
  return Filter;
};

export const IntFilter = createFilter<number>(IsInt);
export const FloatFilter = createFilter<number>(IsNumber);
export const StringFilter = createFilter<string>(IsString);
export const DateFilter = createFilter<Date>(IsDate);
