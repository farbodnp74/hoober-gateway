import { Field, InputType } from "@nestjs/graphql";
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsInt,
  MaxLength,
} from "class-validator";



@InputType()
export class CreateAttribuiteInput {
  @Field()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  name_en: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  slug: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsInt()
  rating ?: number;

  @Field( { nullable: true })
  @IsInt()
  @IsOptional()
  logoFileId: number;


}
