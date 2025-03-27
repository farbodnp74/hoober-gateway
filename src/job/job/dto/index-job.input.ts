import { Field, InputType ,Int} from "@nestjs/graphql";
import { PaginationInput } from "src/base/pagination/dto/pagination.input";
import { IsOptional,IsString,MaxLength,IsBoolean,IsInt,IsNotEmpty,IsEnum,IsArray} from "class-validator";
import { SortDirection } from "src/base/utilities/enums/sort-direction.enum";
import { SortFieldjob } from "../enums/sort-filed-job.enum";

@InputType()
export class IndexjobInput extends PaginationInput {

    @Field({ nullable: true, defaultValue: false })
    @IsOptional()
    @IsBoolean()
    moreDetail?: boolean = false;

    @Field(() => Int, { nullable: true })
    @IsOptional()
    @IsInt()
    brandId?: number;

    @Field(() => Int, { nullable: true })
    @IsOptional()
    @IsInt()
    sellerId?: number;

    @Field(() => SortFieldjob, {
        defaultValue: SortFieldjob.RATING,
        nullable: true,
      })
    @IsNotEmpty()
    @IsEnum(SortFieldjob)
    sortField?: SortFieldjob = SortFieldjob.RATING;
    
    @Field(() => [Int], { nullable: true })
    @IsOptional()
    @IsArray()
    @IsInt({ each: true })
    categoryIds?: number[];

    @Field({ nullable: true })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    query?: string;
    
    @Field(() => SortDirection, {
    defaultValue: SortDirection.ASC,
    nullable: true,
    })
    @IsNotEmpty()
    @IsEnum(SortDirection)
    sortDirection?: SortDirection = SortDirection.ASC;
}
