import { Field, ObjectType } from "@nestjs/graphql";
import { PaginationResponse } from "src/base/utilities/pagination/dto/pagination.response";
import { ImageDTO } from "./imageDTO";

@ObjectType()
export class PaginationImageResponse extends PaginationResponse {
  @Field(() => [ImageDTO], { nullable: "items" })
  data: ImageDTO[];
}
