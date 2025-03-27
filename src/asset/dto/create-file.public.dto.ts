import {
  IsNotEmpty,
  IsOptional,
} from "class-validator";
import { Field} from "@nestjs/graphql";
import { IsEnum,IsString} from "class-validator";
import { FileModelTypeEnum } from "../enums/file-model-type.enum";
import { ThreeStateSupervisionStatuses } from "src/base/utilities/enums/three-state-supervision-statuses.enum";

export class CreateFilePublicDto {

  @Field()
  @IsOptional()
  @IsString()
  name: string;

  @IsOptional()
  orderColumn ?: number;

  @Field(() => FileModelTypeEnum, {
    defaultValue: FileModelTypeEnum.SMALLSLIDER,
    nullable: true,
  })
  @IsNotEmpty()
  @IsEnum(FileModelTypeEnum)
  type?: FileModelTypeEnum = FileModelTypeEnum.SMALLSLIDER;

  @Field(() => ThreeStateSupervisionStatuses, {
    defaultValue: ThreeStateSupervisionStatuses.CONFIRMED,
    nullable: true,
  })
  @IsNotEmpty()
  @IsEnum(ThreeStateSupervisionStatuses)
  status?: ThreeStateSupervisionStatuses = ThreeStateSupervisionStatuses.CONFIRMED;
}
