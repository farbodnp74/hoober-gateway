import { Field, ObjectType, Int } from "@nestjs/graphql";
import { FileDTO } from "./fileDTO";


@ObjectType()
export class BannerDTO {
  @Field(() => Int)
  id: number;

  @Field(() => FileDTO)
  small: FileDTO;

  @Field(() => FileDTO)
  medium: FileDTO;

  @Field(() => FileDTO)
  large: FileDTO;

  @Field(() => FileDTO)
  xlarge: FileDTO;
}
