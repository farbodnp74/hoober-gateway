import { AssetService } from './asset.service';
import { BannerDTO } from './dto/bannerDTO';
import { IndexBannerInput } from './dto/index-banner.input';
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, ValidationPipe } from "@nestjs/common";
import {
  Args,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from "@nestjs/graphql";
import { Cache } from "cache-manager";
import { CacheTTL } from "src/base/utilities/cache-ttl.util";
import { Public } from "src/users/auth/decorators/public.decorator";
import { Permission } from "src/users/authorization/permission.decorator";
@Resolver()
export class AssetResolver {
constructor(private readonly assetService: AssetService) {}

  @Public()
  @Query(() => [BannerDTO])
  async getBanners(
    @Args("IndexBannerInput") IndexBannerInput: IndexBannerInput,
  ): Promise<BannerDTO[]> {

    return this.assetService.getBannersByType()
  }

  @Permission("gql.base.storage.file.destroy")
  @Mutation(() => Boolean)
  removeBanner(@Args("id", { type: () => Int }) id: number) {
    return this.assetService.removeBanner(id);
  }

@Permission("gql.base.storage.file.destroy")
@Mutation(() => Boolean)
updateBanner(
  @Args("id", { type: () => Int }) id: number,
  @Args("small_id", { type: () => Int }) small_id: number,
  @Args("medium_id", { type: () => Int }) medium_id: number,
  @Args("large_id", { type: () => Int }) large_id: number,
  @Args("xlarge_id", { type: () => Int }) xlarge_id: number
) {
  return this.assetService.updateBanner(id, small_id, medium_id,large_id, xlarge_id);
}

  
  @Permission("gql.base.storage.file.destroy")
  @Mutation(() => Boolean)
  createBanner(@Args("large_id", { type: () => Int }) large_id: number,
  @Args("small_id", { type: () => Int }) small_id: number,
  @Args("medium_id", { type: () => Int }) medium_id: number,
  @Args("xlarge_id", { type: () => Int }) xlarge_id: number
) {
    return this.assetService.createBanner(large_id,small_id,medium_id,xlarge_id);
  }
}
