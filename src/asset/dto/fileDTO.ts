import { Field, Int, ObjectType } from "@nestjs/graphql";


@ObjectType()
export class FileDTO {
  @Field(() => Int)
  id: number;

  @Field()
  uuid: string;

  @Field({ nullable: true })
  fullUrl?: string;

}
