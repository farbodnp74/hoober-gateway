import { Field, InputType, Int } from "@nestjs/graphql";
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsUUID,
} from "class-validator";

@InputType()
export class createImageCategoryInput {
  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  categoryId: number;

  @Field()
  @IsOptional()
  @IsUUID("4")
  fileUuid: string;

}
