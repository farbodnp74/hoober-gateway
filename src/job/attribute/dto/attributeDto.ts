import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class AttributeDto  {

  @Field(() => Int)
  id: number;

  @Field()
  name: string;

}
