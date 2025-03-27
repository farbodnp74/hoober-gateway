import { Field, InputType, Int } from "@nestjs/graphql";
import {
  IsBoolean,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  Validate,
} from "class-validator";
import { ThreeStateSupervisionStatuses } from "src/base/utilities/enums/three-state-supervision-statuses.enum";
@InputType()
export class CreatejobInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  slug: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @Field(() => String) 
  @IsOptional()
  @IsString()
  @MaxLength(255)
  sku: string;


  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  brandId: number;

  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  categoryId: number;

  @Field(() => Int)
  @IsNotEmpty()
  @IsInt()
  uomId: number;

  @Field({ defaultValue: true })
  @IsOptional()
  @IsBoolean()
  isActive: boolean;

  @Field(() => ThreeStateSupervisionStatuses)
  @IsNotEmpty()
  @IsEnum(ThreeStateSupervisionStatuses)
  status: ThreeStateSupervisionStatuses;

  @Field({ nullable: true })
  @IsOptional()
  @IsString()
  description: string;
}
