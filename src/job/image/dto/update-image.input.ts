import { IsInt, IsNotEmpty } from "class-validator";
import { CreateImageInput } from "./create-image.input";
import { InputType, Field, Int, PartialType } from "@nestjs/graphql";

@InputType()
export class UpdateImageInput extends PartialType(CreateImageInput) {
  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  id: number;
}
