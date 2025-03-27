import { IndexCategoryInput } from './dto/index-category.input';
import { CategoryDTO } from './dto/categoryDto';
import { PaginationCategoryResponse } from './dto/pagination-category.response';
import { CompressionService } from 'src/compression.service';
import { DecompressionService } from 'src/decompression.service';
import { RabbitMQService } from 'src/rabbit-mq.service';;
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { Cache } from "cache-manager";
import { CacheTTL } from 'src/base/utilities/cache-ttl.util';
import { RabbitAssetsService } from 'src/rabbit-asset.service';
import { User } from 'src/users/user/entities/user.entity';
import { UpdateCategoryInput } from './dto/update-category.input';

@Injectable()
export class CategoryService {
  constructor(
    private readonly compressionService: CompressionService,
    private readonly decompressionService: DecompressionService,
    private readonly rabbitMQService: RabbitMQService, 
    private readonly rabbitAssetsService: RabbitAssetsService, 
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async create(createCategoryInput, user): Promise<CategoryDTO> {
   try{
    const pattern = 'create_category';
    
    const payload = { createCategoryInput,user };

    const compressedPayload = this.compressionService.compressData(payload);

    let result = await this.rabbitMQService.send(pattern, { data: compressedPayload });
    const decompressedResultData = this.decompressionService.decompressData(result);

    if (createCategoryInput.fileUuid) {
      const payloadImage = { decompressedResultData,user ,file:createCategoryInput.fileUuid};

      const compressedPayloadImage = this.compressionService.compressData(payloadImage);

      await this.rabbitAssetsService.send('create_image_category', { data: compressedPayloadImage });
      
    }
    console.log(decompressedResultData)
    return decompressedResultData;
   }catch(err){
    console.log(err)
   } 
    
  }

  async addCategoryFilter(attrribuite_id,category_id): Promise<boolean> {
    try{
      const cacheKey = `filter_category_{id:${category_id}}`;
      const keyExists = await this.cacheManager.get(cacheKey);
      if (keyExists) {
        await this.cacheManager.del(cacheKey);
      }
     const pattern = 'add_category_filter';
     
     const payload = { attrribuite_id,category_id };
 
     const compressedPayload = this.compressionService.compressData(payload);
 
     this.rabbitMQService.send(pattern, { data: compressedPayload });

     return true;
    }catch(err){
     console.log(err)

     return false;
    } 
     
   }
   async removeCategoryFilter(attrribuite_id,category_id): Promise<boolean> {
    try{
      const cacheKey = `filter_category_{id:${category_id}}`;
      const keyExists = await this.cacheManager.get(cacheKey);
      if (keyExists) {
        await this.cacheManager.del(cacheKey);
      }
     const pattern = 'remove_category_filter';
     
     const payload = { attrribuite_id,category_id };
 
     const compressedPayload = this.compressionService.compressData(payload);
 
     this.rabbitMQService.send(pattern, { data: compressedPayload });

     return true;
    }catch(err){
     console.log(err)

     return false;
    } 
     
   }
  async remove(id, user): Promise<CategoryDTO> {
    try{
     const pattern = 'remove_category';
     
     const payload = { id };
 
     const compressedPayload = this.compressionService.compressData(payload);
 
     let result = await this.rabbitMQService.send(pattern, { data: compressedPayload });
     const decompressedResultData = this.decompressionService.decompressData(result);
     return decompressedResultData;
    }catch(err){
     console.log('remove category ',err)
 
      throw new Error('category cant remove');
      
    } 
     
   }
  async getAllCategory(indexCategoryInput: IndexCategoryInput): Promise<PaginationCategoryResponse> {

    indexCategoryInput.boot();
    const cacheKey = `categories_${JSON.stringify(indexCategoryInput)}`;
  
    const cachedData = await this.cacheManager.get<string>(cacheKey);
  
    if (cachedData) {
      const decompressedData : PaginationCategoryResponse = 
      this.decompressionService.decompressData(cachedData);
 
      return decompressedData;

    }

    const pattern = 'pagination_categories';
    
    const payload = { indexCategoryInput };

    const compressedPayload = this.compressionService.compressData(payload);

    let result = await this.rabbitMQService.send(pattern, { data: compressedPayload });
    const decompressedResultData = this.decompressionService.decompressData(result);
     
    const categoryIds = await this.extractCategoryIds(decompressedResultData[0]);
 
    const parentCategoryIds =  await this.extractParentCategoryIds(decompressedResultData[0]);

    const promises = [
      this.sendImageMessage(categoryIds),
      this.getParentData(parentCategoryIds),
    ];

    const [categoryImage,parentData] = await Promise.all(promises);
    // const categoryImage = await this.sendImageMessage(categoryIds);

    const productsWithImageUrls = decompressedResultData[0].map((category: CategoryDTO) => {
      const correspondingImageUrl = categoryImage.find(asset => asset.id === category.id)?.imageUrl || null;
      const correspondingParent = parentData.find(parent => parent.id === category.parentCategoryId) || null;
      
      return {
          ...category,
          parent:correspondingParent,
          imageUrl: correspondingImageUrl
      };
    });
    const decompressedResult: PaginationCategoryResponse =
    PaginationCategoryResponse.make(indexCategoryInput, decompressedResultData[1], productsWithImageUrls);
    
    await this.cacheManager.set(
      cacheKey,this.compressionService.compressData(decompressedResult)
      ,CacheTTL.ONE_DAY
    );
    
    return decompressedResult;

  }
  private async getParentData(parentIds: number[]) {
    const cacheKey = `parent_categories_{ids:${parentIds}}`;
      
    const cachedData = await this.cacheManager.get<string>(cacheKey);
  
    if (cachedData) {
      const decompressedResultData = this.decompressionService.decompressData(cachedData)
      return decompressedResultData;
    }

    const payload = { parentIds };
    const compressedPayload = this.compressionService.compressData(payload);
      
    const result = await this.rabbitMQService.send('getParentCategoriesFromIds', { data: compressedPayload });

    const decompressedResultData = this.decompressionService.decompressData(result)

    await this.cacheManager.set(cacheKey, result,CacheTTL.THREE_DAYS);
    return decompressedResultData;
  }
  async update(
    updateCategoryInput: UpdateCategoryInput,
  ): Promise<CategoryDTO> {
    try{
      const cacheKey = `category_{id:${updateCategoryInput.id}}`;
      const pattern = 'update_category';
      const keyExists = await this.cacheManager.get(cacheKey);
      if (keyExists) {
        await this.cacheManager.del(cacheKey);
      }
      
      const payload = { updateCategoryInput };
  
      const compressedPayload = this.compressionService.compressData(payload);
  
      const result = await this.rabbitMQService.send(pattern, { data: compressedPayload });
      const decompressedResult = this.decompressionService.decompressData(result);
      await this.cacheManager.set(cacheKey, result,CacheTTL.ONE_DAY);
      return decompressedResult;
     }catch(err){
      console.log('updateCategory category ',err)
  
      throw new Error('update Category cant');
       
     } 
  }

  private async sendImageMessage(categoryIds: number[]) {
    const cacheKey = `image_categories_{ids:${categoryIds}}`;
      
    const cachedData = await this.cacheManager.get<string>(cacheKey);
  
    if (cachedData) {
      const decompressedResultData = this.decompressionService.decompressData(cachedData)
      return decompressedResultData;
    }

    const payload = { categoryIds };
    const compressedPayload = this.compressionService.compressData(payload);
    const secondResult = await this.rabbitAssetsService.send('getImageCategory', { data: compressedPayload });
    const decompressedResultData = this.decompressionService.decompressData(secondResult)

    await this.cacheManager.set(cacheKey, secondResult,CacheTTL.THREE_DAYS);
    return decompressedResultData;
  }

  async extractCategoryIds(result: any): Promise<number[]> {
    return result.map(item => item.id);
  }

  async extractParentCategoryIds(result: any): Promise<number[]> {
    return result.map(item => item.parentCategoryId);
  }


  async findOne(id: number, slug?: string): Promise<CategoryDTO>{
    try{
        const cacheKey = `category_{id:${id}}`;
        const cachedData = await this.cacheManager.get<string>(cacheKey);
      
        if (cachedData) {
          const decompressedData : CategoryDTO = 
          this.decompressionService.decompressData(cachedData);
    
          return decompressedData;

        }

        const pattern = 'find_one_category';
        
        const payload = { id, slug };

        const compressedPayload = this.compressionService.compressData(payload);

        let result = await this.rabbitMQService.send(pattern, { data: compressedPayload });

        await this.cacheManager.set(cacheKey, result,CacheTTL.ONE_DAY);

        const decompressedResult : CategoryDTO = this.decompressionService.decompressData(result);
        const categoryIds = await this.extractCategoryIds([decompressedResult]);
        const parentCategoryIds = await this.extractParentCategoryIds([decompressedResult]);
        const promises = [
          this.sendImageMessage(categoryIds),
          this.getParentData(parentCategoryIds),
        ];
    
        const [categoryImage,parentData] = await Promise.all(promises);
        const productsWithImageUrls = {
          ...decompressedResult,
          parent : parentData.find(parent => parent.id === decompressedResult.parentCategoryId) || null,
          imageUrl: categoryImage.find(asset => asset.id === decompressedResult.id)?.imageUrl || null
        };
      
        return productsWithImageUrls;
      }catch (error) {
       
      throw new Error('category not found');
      
    }
  }


}
