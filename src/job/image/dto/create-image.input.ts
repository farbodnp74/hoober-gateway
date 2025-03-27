import { Field, InputType, Int } from "@nestjs/graphql";
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsUUID,
} from "class-validator";

@InputType()
export class CreateImageInput {
  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  productId: number;

  @Field()
  @IsNotEmpty()
  fileId: number;

  @Field(() => Int, { defaultValue: 0 })
  @IsOptional()
  @IsInt()
  sort = 0;

  @Field(() => Boolean, { defaultValue: true })
  @IsOptional()
  @IsBoolean()
  isPublic = true;
}
