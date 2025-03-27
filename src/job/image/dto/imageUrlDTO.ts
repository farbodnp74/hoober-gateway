import { Field, ObjectType, Int } from "@nestjs/graphql";


@ObjectType()
export class ImageUrlDTO {
  @Field(() => Int, { nullable: true })
  id: number;

  @Field(() => Int, { nullable: true })
  productId: number;

  @Field({ nullable: true })
  imageUrl: string;

}
