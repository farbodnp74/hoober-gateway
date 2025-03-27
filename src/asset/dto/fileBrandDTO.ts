import { Field, Int, ObjectType } from "@nestjs/graphql";
import { BrandTypeEnum } from "src/product/brand/enums/brnad-type.enum";

import {
  IsNotEmpty,
  IsOptional,
} from "class-validator";
import { IsEnum} from "class-validator";

@ObjectType()
export class FileBrandDTO {
  @Field(() => Int)
  id: number;

  @Field({ nullable: true })
  name ?: string;

  @Field({ nullable: true })
  fullUrl ?: string;

  @Field(() => BrandTypeEnum, {
    defaultValue: BrandTypeEnum.CATALOGUE,
    nullable: true,
  })
  @IsNotEmpty()
  @IsEnum(BrandTypeEnum)
  type?: BrandTypeEnum = BrandTypeEnum.CATALOGUE;

  @Field({ nullable: true })
  create_at ?: string;

}
