import { ValidationPipe } from "@nestjs/common";
import {
  Args,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from "@nestjs/graphql";
import { CurrentUser } from "src/users/auth/decorators/current-user.decorator";
import { Permission } from "src/users/authorization/permission.decorator";
import { User } from "src/users/user/entities/user.entity";
import { CreateImageInput } from "./dto/create-image.input";
import { ImagesService } from "./images.service";
import { ImageDTO } from "./dto/imageDTO";

@Resolver(() => ImageDTO)
export class ImagesResolver {
  constructor(private readonly imagesService: ImagesService) {}

  @Permission("gql.products.image.store")
  @Mutation(() => Boolean)
  createImage(
    @Args("createImageInput") createImageInput: CreateImageInput,
    @CurrentUser() user: User,
  ) {
    return this.imagesService.create(createImageInput, user);
  }

  @Permission("gql.products.image.store")
  @Mutation(() => Boolean)
  updateImage(
    @Args("sort", { type: () => Int }) sort: number,
    @Args("productId", { type: () => Int }) productId: number,
    @Args("imageId", { type: () => Int }) imageId: number,
 
  ) {
    return this.imagesService.updateImage(sort, imageId,productId);
  }


  @Permission("gql.products.image.destroy")
  @Mutation(() => Boolean)
  removeImage(@Args("id", { type: () => Int }) id: number,
  @Args("productId", { type: () => Int }) productId: number
) {
    return this.imagesService.remove(id,productId);
  }
}
