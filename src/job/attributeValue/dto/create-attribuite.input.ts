import { Field, InputType } from "@nestjs/graphql";
import {
  IsNotEmpty,
  IsString,
  MaxLength,
} from "class-validator";



@InputType()
export class CreateValueInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  value: string;

}
