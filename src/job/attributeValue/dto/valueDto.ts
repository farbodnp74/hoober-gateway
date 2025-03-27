import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class ValueDto  {

  @Field(() => Int)
  id: number;

  @Field()
  value: string;

}
