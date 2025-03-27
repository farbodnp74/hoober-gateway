import { Field, InputType, Int } from "@nestjs/graphql";
import { IsNotEmpty, IsOptional,  IsUUID ,Validate } from "class-validator";


@InputType()
export class CreateCategoryInput {


  @Field(() => Int, { nullable: true })
  @IsOptional()
  parentCategoryId?: number;

  @Field()
  @IsNotEmpty()
  title: string;

  @Field({ nullable: true })
  @IsOptional()
  titleEn?: string;


  @Field({ nullable: true })
  @IsOptional()
  description?: string;

  @Field({ nullable: true })
  @IsOptional()
  slug?: string;

  @Field({ nullable: true })
  @IsOptional()
  icon?: string;


  @Field({ nullable: true })
  @IsOptional()
  @IsUUID("4")
  fileUuid?: string;


  @Field(() => Int, { nullable: true, defaultValue: 0 })
  @IsOptional()
  sort = 0;

  @Field({ defaultValue: true })
  @IsNotEmpty()
  isActive: boolean;
}
