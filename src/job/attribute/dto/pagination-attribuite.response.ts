import { Field, ObjectType } from "@nestjs/graphql";
import { PaginationResponse } from "src/base/pagination/dto/pagination.response";
import { AttributeDto } from "./attributeDto";

@ObjectType()
export class PaginationAttribuiteResponse extends PaginationResponse {
  @Field(() => [AttributeDto], { nullable: "items" })
  data: AttributeDto[];
}
