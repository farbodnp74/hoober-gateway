import { Field, ObjectType } from "@nestjs/graphql";
import { PaginationResponse } from "src/base/pagination/dto/pagination.response";
import { CategoryDTO } from "./categoryDto";

@ObjectType()
export class PaginationCategoryResponse extends PaginationResponse {
  @Field(() => [CategoryDTO], { nullable: "items" })
  data: CategoryDTO[];
}
