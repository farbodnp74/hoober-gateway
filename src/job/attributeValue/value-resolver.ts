// src/graphql/graphql.resolver.ts
import { Resolver, Query, Args, Int, Mutation } from '@nestjs/graphql';
import { Public } from 'src/base/public.decorator';
import {ValidationPipe } from "@nestjs/common";
import { ValueService } from './value.service';
import { ValueDto } from './dto/valueDto';
import { PaginationValueResponse } from './dto/pagination-value.response';
import { IndexValueInput } from './dto/index-value.input';
import { CreateSingleValueInput } from '../attribute/dto/create-single-value.input';
import { Permission } from "src/users/authorization/permission.decorator";
import { AttributeValueDto } from '../attribute/dto/attributeValueDto';
import { UpdateAttributeValueInput } from './dto/update-attribute-value.input';

@Resolver(() => ValueDto)
export class ValueResolver {
  constructor(private readonly ValueService: ValueService) {}

  @Public()
  @Query(() => PaginationValueResponse, { name: 'values' })
  paginate
    ( 
      @Args('indexValueInput', { type: () => IndexValueInput, nullable: true },
       new ValidationPipe({ transform: true }))
       indexValueInput: IndexValueInput,
    ) : Promise<PaginationValueResponse>  {

    return this.ValueService.paginate(indexValueInput);
  }

  @Permission("gql.products.attribute_value.update")
  @Mutation(() => Boolean)
  updateAttributeValue(
    @Args("updateAttributeValueInput")
    updateAttributeValueInput: UpdateAttributeValueInput,
  ) {
    return this.ValueService.update(
      updateAttributeValueInput.id,
      updateAttributeValueInput,
    );
  }

  @Permission("gql.products.attribute_value.destroy")
  @Mutation(() => Boolean)
  removeAttributeValue(@Args("id", { type: () => Int }) id: number) {
    return this.ValueService.remove(id);
  }

  @Mutation(() => Boolean)
  updateAttribuitesValue(
    @Args("id") id: number,
    @Args("value") value: string,
  ) {
    return this.ValueService.updateAttribuitesValue(id,value);
  }

  // @Mutation(() => brandDto)
  // createBrand(
  //   @Args("createBrandInput") createBrandInput: CreateBrandInput,
  // ) {
  //   return this.brandService.create(createBrandInput);
  // }
  

  // @Public()
  // @Query(() => brandDto, { name: 'brand' })
  // findOne(
  //   @Args("id", {type: () => Int}) id: number
  // ) : Promise<brandDto> {
  //   return this.brandService.findOne(id)
  // }

  // @Public()
  // @Mutation(() => brandDto, { name: 'removeBrand' })
  // remove(
  //   @Args("id", { type: () => Int }) id: number
  // ) : Promise<brandDto> {
  //   return this.brandService.remove(id);
  // }
  @Mutation(() => ValueDto)
  createAttribuitesValue(
    @Args("createSingleValueInput") createSingleValueInput: CreateSingleValueInput,
  ) {
    return this.ValueService.create(createSingleValueInput);
  }
  
}
