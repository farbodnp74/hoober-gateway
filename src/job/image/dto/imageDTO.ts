import { Field, ObjectType, Int } from "@nestjs/graphql";
import { IsBoolean, IsInt, IsNotEmpty, IsOptional, IsUUID } from "class-validator";

@ObjectType()
export class ImageDTO {
  @Field(() => Int)
  productId: number;

  @Field(() => Int)
  fileId: number;
}
