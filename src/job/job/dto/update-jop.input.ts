import { IsInt, IsNotEmpty,IsString,IsOptional } from "class-validator";
import { CreatejobInput } from "./create-job.input";
import { InputType, Field, Int, PartialType } from "@nestjs/graphql";

@InputType()
export class UpdatejobInput extends PartialType(CreatejobInput) {
  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  id: number;

  @Field(() => String) 
  @IsOptional()
  @IsString()
  parent_name: string;
}
