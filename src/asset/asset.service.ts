import { Cache } from 'cache-manager';
import { FileDTO } from './dto/fileDTO';
import { CompressionService } from 'src/compression.service';
import { DecompressionService } from 'src/decompression.service';
import { RabbitAssetsService } from 'src/rabbit-asset.service';
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable } from "@nestjs/common";
import { CacheTTL } from 'src/base/utilities/cache-ttl.util';
import { CreateFilePublicDto } from './dto/create-file.public.dto';
import { User } from 'src/users/user/entities/user.entity';
import { Client } from "minio";
import { InjectMinio } from "nestjs-minio";
import { BannerDTO } from './dto/bannerDTO';
import { BasketType } from './enums/basket-type';

enum BannerType {
  Mobile = 'mobile',
  Desktop = 'desktop'
}
@Injectable()
export class AssetService {
  constructor(
    private readonly compressionService: CompressionService,
    private readonly decompressionService: DecompressionService,
    private readonly rabbitAssetsService: RabbitAssetsService,
    @InjectMinio() private readonly minioClient: Client,  
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache) {}

  async findDirectory(input: string): Promise<String> {
      switch(input) {
          case "SMALLSLIDER":
              return "banner/mobile" ;
          case "AVATARUSER":
              return "user/user/avatars" ;
          case "IMAGEPRODUCT":
              return "product/image/files" ;
          case "MEDIUMSLIDER":
              return  "banner/mobile";
          case "LARGESLIDER":
              return "banner/mobile" ;
          case "XLARGESLIDER":
              return  "banner/mobile" ;
          case "ORDERFILE":
              return  "brand/cataloge" ;
          case "CATALOGE":
              return  "brand/cataloge" ;
          case "PRICELIST":
              return  "brand/priceList" ;
          case "LOGOFILESELLER":
              return  "product/seller/logos" ;
          case "LOGOFILEBRAND":
              return  "product/brand/logos" ;
          case "BANNERFILESELLER":
              return  "product/seller/banner" ;
          case "BRANDBANNER":
              return  "product/brand/banner" ;
      }
  }

  async create(
    createFileDto: CreateFilePublicDto,
    file: Express.Multer.File,
    user: User,
  ): Promise<FileDTO> {
    try{
      const pattern = 'upload_files';
      const payload = {
         createFileDto,
         userId:user.id,
         mimetype:file.mimetype,
         orderColumn:0,
         size:file.size,
         type: await this.findDirectory(createFileDto.type),
      };
  
      const compressedPayload = this.compressionService.compressData(payload);
      let result = await this.rabbitAssetsService.send(pattern, { data: compressedPayload });
      const decompressResult =  this.decompressionService.decompressData(result)
      await this.minioClient.putObject(
        BasketType.VARDAST,
        decompressResult.name,
        file.buffer,
        file.size, 
        {
          "Content-Type": file.mimetype,
          "File-Uuid": decompressResult.uuid,
          "File-Id": decompressResult.id,
        },
      );
      return decompressResult
    } catch(e) {
      console.log('upload_files',e)

    }
   
  }

   async removeBanner(id:number): Promise<boolean> {
    const pattern = 'remove_banner';

    let result = await this.rabbitAssetsService.send(pattern, { data: id });

    return result;
  }

  async getBannersByType(): Promise<BannerDTO[]> {
    const cacheKey = `banners_{modelType}`;
    
    const cachedData = await this.cacheManager.get<string>(cacheKey);
  
    if (cachedData) {
 
      return this.decompressionService.decompressData(cachedData);

    }
    const pattern = 'getBanners';

    let result = await this.rabbitAssetsService.send(pattern, { data: {} });
    const res = this.decompressionService.decompressData(result)

    await this.cacheManager.set(cacheKey,result,CacheTTL.ONE_DAY);
    return res;
  }

  async createBanner(large_id,small_id,medium_id,xlarge_id): Promise<boolean> {
    try{
      const cacheKey = `banners_{modelType}`;
      const keyExists = await this.cacheManager.get(cacheKey);
      if (keyExists) {
        await this.cacheManager.del(cacheKey);
      }
      const pattern = 'create_banners';

      const payload = {
        large_id,
        small_id,
        medium_id,
        xlarge_id,
     };
  
     const compressedPayload = this.compressionService.compressData(payload);
  
     this.rabbitAssetsService.send(pattern, { data: compressedPayload });

      return true;
    }catch(e){
      // console.log('err in createBanner',e)
      return false
    }
 
  }

  async updateBanner(id,smallId,mediumId,largeId,xlargeId): Promise<boolean> {
    try{
      const cacheKey = `banners_{modelType}`;
      const keyExists = await this.cacheManager.get(cacheKey);
      if (keyExists) {
        await this.cacheManager.del(cacheKey);
      }
      const pattern = 'update_banners';

      const payload = {
        id,
        largeId,
        smallId,
        mediumId,
        xlargeId,
     };
  
     const compressedPayload = this.compressionService.compressData(payload);
  
      this.rabbitAssetsService.send(pattern, { data: compressedPayload });

      return true;
    }catch(e){
      console.log('err in createBanner',e)
      return false
    }
 
  }
}
