import { Field, InputType ,Int} from "@nestjs/graphql";
import { IsOptional ,IsBoolean,IsInt,IsNotEmpty,Matches,IsEnum} from "class-validator";
import { PaginationInput } from "src/base/pagination/dto/pagination.input";
import { SortDirection } from "src/base/utilities/enums/sort-direction.enum";
import { SortField } from "src/base/utilities/enums/sort-types.enum";



@InputType()
export class IndexCategoryInput extends PaginationInput {
  @Field(type => Int, { nullable: true })
  @IsOptional()
  id?: number;

  @Field({ nullable: true, defaultValue: true })
  @IsOptional()
  @IsBoolean()
  onlyRoots?: boolean = true;

  @Field(type => Int, { nullable: true })
  @IsOptional()
  @IsInt()
  parentCategoryId?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean = true;

  @Field({ nullable: true })
  @IsOptional()
  @IsBoolean()
  hasImage?: boolean;

  @Field(() => String, { nullable: true })
  @IsOptional()
  name?: string;

  @Field({ nullable: true })
  @IsOptional()
  @IsInt()
  brandId?: number;

  @Field({ nullable: true })
  @IsOptional()
  @IsInt()
  sellerId?: number;

  @Field(() => SortField, {
    defaultValue: SortField.TITLE,
    nullable: true,
  })
  @IsNotEmpty()
  @IsEnum(SortField)
  sortField?: SortField = SortField.TITLE;


  @Field(() => SortDirection, {
    defaultValue: SortDirection.ASC,
    nullable: true,
  })
  @IsNotEmpty()
  @IsEnum(SortDirection)
  sortDirection?: SortDirection = SortDirection.ASC;
}
