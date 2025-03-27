import { Field, Int, ObjectType } from "@nestjs/graphql";

@ObjectType()
export class AttributeValueDto  {

  @Field(() => Int)
  id: number;

  @Field({ nullable: true })
  attribute: string;

  @Field({ nullable: true })
  value: string;

  constructor(id:number,attribute: string, value: string) {
    this.attribute = attribute;
    this.id = id;
    this.value = value;
  }
}
