// src/graphql/graphql.resolver.ts
import { Resolver, Query, Args, Int, Mutation } from '@nestjs/graphql';
import { Public } from 'src/base/public.decorator';
import {ValidationPipe } from "@nestjs/common";
import { IndexAttribuiteInput } from './dto/index-attribuite.input';
import { PaginationAttribuiteResponse } from './dto/pagination-attribuite.response';
import { AttributeDto } from './dto/attributeDto';
import { AttribuiteService } from './attribuite.service';
import { CreateSingleAttributeInput } from './dto/create-single-attribute.input';
import { ValueDto } from '../attributeValue/dto/valueDto';
import { CreateSingleValueInput } from './dto/create-single-value.input';
import { UpdateSingleAttributeInput } from './dto/update-attribute.input';

@Resolver(() => AttributeDto)
export class AttribuiteResolver {
  constructor(private readonly attribuiteService: AttribuiteService) {}

  @Public()
  @Query(() => PaginationAttribuiteResponse, { name: 'attribuites' })
  paginate
    ( 
      @Args('indexAttribuiteInput', { type: () => IndexAttribuiteInput, nullable: true },
       new ValidationPipe({ transform: true }))
       indexAttribuiteInput: IndexAttribuiteInput,
    ) : Promise<PaginationAttribuiteResponse>  {

    return this.attribuiteService.paginate(indexAttribuiteInput);
  }

  @Mutation(() => AttributeDto)
  createAttribuites(
    @Args("createSingleAttributeInput") createSingleAttributeInput: CreateSingleAttributeInput,
  ) {
    return this.attribuiteService.create(createSingleAttributeInput);
  }

  @Mutation(() => Boolean)
  updateAttribuites(
    @Args("updateSingleAttributeInput") updateSingleAttributeInput: UpdateSingleAttributeInput,
  ) {
    return this.attribuiteService.update(updateSingleAttributeInput);
  }

 
  

  @Public()
  @Query(() => AttributeDto, { name: 'attribuite' })
  findOne(
    @Args("id", {type: () => Int}) id: number
  ) : Promise<AttributeDto> {
    return this.attribuiteService.findOne(id)
  }

  // @Public()
  // @Mutation(() => brandDto, { name: 'removeBrand' })
  // remove(
  //   @Args("id", { type: () => Int }) id: number
  // ) : Promise<brandDto> {
  //   return this.brandService.remove(id);
  // }
}
