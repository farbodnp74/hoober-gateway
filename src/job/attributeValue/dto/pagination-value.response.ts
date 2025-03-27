import { Field, ObjectType } from "@nestjs/graphql";
import { PaginationResponse } from "src/base/pagination/dto/pagination.response";
import {  ValueDto } from "./valueDto";

@ObjectType()
export class PaginationValueResponse extends PaginationResponse {
  @Field(() => [ValueDto], { nullable: "items" })
  data: ValueDto[];
}
