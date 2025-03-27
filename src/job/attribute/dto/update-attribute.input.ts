import { IsInt, IsNotEmpty } from "class-validator";
import { InputType, Field, Int, PartialType } from "@nestjs/graphql";
import { CreateSingleAttributeInput } from "./create-single-attribute.input";

@InputType()
export class UpdateSingleAttributeInput extends PartialType(
  CreateSingleAttributeInput,
) {
  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  id: number;
}
