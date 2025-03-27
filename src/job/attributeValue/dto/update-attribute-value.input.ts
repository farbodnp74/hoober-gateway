import { IsInt, IsNotEmpty } from "class-validator";
import { CreateAttributeValueInput } from "./create-attribute-value.input";
import { InputType, Field, Int, PartialType } from "@nestjs/graphql";

@InputType()
export class UpdateAttributeValueInput extends PartialType(
  CreateAttributeValueInput,
) {
  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  id: number;

  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  productId: number;
}
