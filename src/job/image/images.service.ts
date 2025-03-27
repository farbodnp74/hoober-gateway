import { Injectable, NotFoundException } from "@nestjs/common";
import { User } from "src/users/user/entities/user.entity";
import { DataSource } from "typeorm";
import { CreateImageInput } from "./dto/create-image.input";
import { IndexImageInput } from "./dto/index-image.input";
import { PaginationImageResponse } from "./dto/pagination-images.response";
import { UpdateImageInput } from "./dto/update-image.input";
import { ImageDTO } from "./dto/imageDTO";
import { CompressionService } from "src/compression.service";
import { DecompressionService } from "src/decompression.service";
import { RabbitMQService } from "src/rabbit-mq.service";
import { RabbitAssetsService } from "src/rabbit-asset.service";
import { RabbitSellersService } from "src/rabbit-seller.service";
import { RabbitLogsService } from "src/rabbit-log.service";
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject } from "@nestjs/common";
import { Cache } from "cache-manager";
@Injectable()
export class ImagesService {
  constructor(
    protected dataSource: DataSource,
    private readonly compressionService: CompressionService,
    private readonly decompressionService: DecompressionService,
    private readonly rabbitMQService: RabbitMQService,
    private readonly rabbitAssetsService: RabbitAssetsService,  
    private readonly rabbitSellersService: RabbitSellersService, 
    private readonly rabbitLogsService: RabbitLogsService, 
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async create(createImageInput: CreateImageInput, user: User): Promise<Boolean> {
    const cacheKey = `product_{id:${createImageInput.productId}}`;
    const keyExists = await this.cacheManager.get(cacheKey);
    if (keyExists) {
      await this.cacheManager.del(cacheKey);
    }
    const payload = { createImageInput };

    const compressedPayload = this.compressionService.compressData(payload);

    this.rabbitAssetsService.send('create_image_product', { data: compressedPayload });
    return true;
  }

  async updateImage(sort: number, imageId : number,productId:number): Promise<Boolean> {
    const cacheKey = `product_{id:${productId}}`;
    const keyExists = await this.cacheManager.get(cacheKey);
    if (keyExists) {
      await this.cacheManager.del(cacheKey);
    }
    const payload = { sort,imageId,productId };

    const compressedPayload = this.compressionService.compressData(payload);

    this.rabbitAssetsService.send('update_image_product', { data: compressedPayload });
    return true;
  }

  
  async remove(id: number,productId:number): Promise<Boolean> {
    const cacheKey = `product_{id:${productId}}`;
    const keyExists = await this.cacheManager.get(cacheKey);
    if (keyExists) {
      await this.cacheManager.del(cacheKey);
    }
    const payload = { id };

    const compressedPayload = this.compressionService.compressData(payload);

    this.rabbitAssetsService.send('remove_image_product', { data: compressedPayload });
    return true;

  }
  
}
