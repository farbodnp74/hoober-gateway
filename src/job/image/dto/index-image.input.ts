import { Field, InputType } from "@nestjs/graphql";
import { IsOptional } from "class-validator";
import { IndexInput } from "src/base/utilities/dto/index.input";

@InputType()
export class IndexImageInput extends IndexInput {
  @Field({ nullable: true })
  @IsOptional()
  productId?: number;

  @Field({ nullable: true })
  @IsOptional()
  isPublic?: boolean;
}
