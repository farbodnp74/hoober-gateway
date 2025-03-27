// src/graphql/graphql.resolver.ts
import { Resolver, Query, Args, Int, Mutation } from '@nestjs/graphql';
import { CategoryService } from '../category/category.service';
import { Public } from 'src/base/public.decorator';
import {ValidationPipe } from "@nestjs/common";
import { CategoryDTO } from '../category/dto/categoryDto';
import { PaginationCategoryResponse } from '../category/dto/pagination-category.response';
import { IndexCategoryInput } from '../category/dto/index-category.input';
import { Permission } from "src/users/authorization/permission.decorator";
import { CreateCategoryInput } from "./dto/create-category.input";
import { User } from "src/users/user/entities/user.entity";
import { CurrentUser } from "src/users/auth/decorators/current-user.decorator";
import { UpdateCategoryInput } from './dto/update-category.input';
@Resolver(() => CategoryDTO)
export class CategoryResolver {
  constructor(private readonly categoryService: CategoryService) {}

  @Public()
  @Query(() => PaginationCategoryResponse, { name: 'categories' })
  categories
    ( 
      @Args('indexCategoryInput', { type: () => IndexCategoryInput, nullable: true }, new ValidationPipe({ transform: true }))
      indexCategoryInput: IndexCategoryInput,
    ) : Promise<PaginationCategoryResponse>  {

    return this.categoryService.getAllCategory(indexCategoryInput);
  }
  
  @Permission("gql.base.taxonomy.category.store")
  @Mutation(() => CategoryDTO)
  createCategory(
    @Args("createCategoryInput") createCategoryInput: CreateCategoryInput,
    @CurrentUser() user: User
  ) {
    return this.categoryService.create(createCategoryInput,user);
  }

  @Permission("gql.base.taxonomy.category.store")
  @Mutation(() => Boolean)
  addCategoryFilter(
    @Args("attrribuite_id") attrribuite_id: number,
    @Args("category_id") category_id: number,
  ) {
    return this.categoryService.addCategoryFilter(attrribuite_id,category_id);
  }

  @Permission("gql.base.taxonomy.category.store")
  @Mutation(() => Boolean)
  removeCategoryFilter(
    @Args("attrribuite_id") attrribuite_id: number,
    @Args("category_id") category_id: number,
  ) {
    return this.categoryService.removeCategoryFilter(attrribuite_id,category_id);
  }

  @Permission("gql.base.taxonomy.category.store")
  @Mutation(() => CategoryDTO)
  removeCategory(
    @Args("id") id: number,
    @CurrentUser() user: User
  ) {
    return this.categoryService.remove(id,user);
  }
  

  @Public()
  @Query(() => CategoryDTO, { name: 'category' })
  findOne(
    @Args("id", {type: () => Int}) id: number
  ) : Promise<CategoryDTO> {
    return this.categoryService.findOne(id)
  }

  @Permission("gql.base.taxonomy.category.update")
  @Mutation(() => CategoryDTO)
  updateCategory(
    @Args("updateCategoryInput") updateCategoryInput: UpdateCategoryInput,
  ) {
    return this.categoryService.update(
      updateCategoryInput
    );
  }
}
