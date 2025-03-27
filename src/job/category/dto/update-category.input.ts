import { Field, InputType, Int, PartialType } from "@nestjs/graphql";
import { IsInt, IsNotEmpty,IsUUID,IsOptional } from "class-validator";
import { CreateCategoryInput } from "./create-category.input";

@InputType()
export class UpdateCategoryInput extends PartialType(CreateCategoryInput) {
  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  id: number;

  // @Field({ nullable: true })
  // @IsOptional()
  // @IsUUID("4")
  // fileUuid?: string;
}
