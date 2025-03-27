import { Field, InputType } from "@nestjs/graphql";
import { IsNotEmpty,IsOptional } from "class-validator";
import { FileModelTypeEnum } from "../enums/file-model-type.enum";

@InputType()
export class IndexBannerInput {
  @Field(() => FileModelTypeEnum,{nullable:true})
  @IsOptional()
  type?: FileModelTypeEnum;
}
