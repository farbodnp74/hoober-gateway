import { Field, Int, ObjectType } from "@nestjs/graphql";
import { Exclude, Expose } from "class-transformer";

@ObjectType()
@Exclude()
export class CategoryDTO {
  @Field(() => Int)
  id: number;

  @Field(() => Int,{ nullable: true })
  parentCategoryId?: number;

  @Field()
  title: string;

  @Field({ nullable: true })
  titleEn?: string;

  @Field({ nullable: true })
  description?: string;

  @Field({ nullable: true })
  url?: string;

  @Field(() => Int)
  sort: number;

  @Field(() => Int,{ nullable: true })
  products_count: number;

  @Field(() => Int,{ nullable: true })
  childCount: number;

  @Field({ nullable: true })
  imageUrl: string;

  @Field({ defaultValue: true })
  isActive: boolean;

  @Field({ defaultValue: false })
  hasImage: boolean;

  @Field({ nullable: true })
  createdAt?: string;

  @Field({ nullable: true })
  updatedAt?: string;

  @Field(() => CategoryDTO, { nullable: true })
  parent: CategoryDTO;

  constructor(partial: Partial<CategoryDTO>) {
    Object.assign(this, partial);
  }
}
