import { Field, Int, ObjectType } from "@nestjs/graphql";
import {
  IsNotEmpty,
  IsOptional,
} from "class-validator";
import { IsEnum} from "class-validator";
import { SellerTypeEnum } from "src/seller/seller/enums/seller-type.enum";

@ObjectType()
export class FileSellerDTO {
  @Field(() => Int)
  id: number;

  @Field({ nullable: true })
  name ?: string;

  @Field({ nullable: true })
  fullUrl ?: string;

  @Field(() => SellerTypeEnum, {
    defaultValue: SellerTypeEnum.LOGO,
    nullable: true,
  })
  @IsNotEmpty()
  @IsEnum(SellerTypeEnum)
  type?: SellerTypeEnum = SellerTypeEnum.LOGO;

}
