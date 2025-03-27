import { Field, ObjectType } from "@nestjs/graphql";
import { PaginationResponse } from "src/base/pagination/dto/pagination.response";
import { jobDTO } from "./jobDTO";

@ObjectType()
export class PaginationjobResponse extends PaginationResponse {
  @Field(() => [jobDTO], { nullable: "items" })
  data: jobDTO[];
}
