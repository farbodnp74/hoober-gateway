import { Field, InputType, Int } from "@nestjs/graphql";
import {
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
} from "class-validator";

@InputType()
export class CreateSingleValueInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  value: string;


}
