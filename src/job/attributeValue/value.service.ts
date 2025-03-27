
import { CompressionService } from 'src/compression.service';
import { DecompressionService } from 'src/decompression.service';
import { RabbitMQService } from 'src/rabbit-mq.service';
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { Cache } from "cache-manager";
import { CacheTTL } from 'src/base/utilities/cache-ttl.util';
import { IndexValueInput } from './dto/index-value.input';
import { PaginationValueResponse } from './dto/pagination-value.response';
import { AttributeDto } from '../attribute/dto/attributeDto';
import { CreateSingleValueInput } from '../attribute/dto/create-single-value.input';
import { ValueDto } from './dto/valueDto';
import { UpdateAttributeValueInput } from './dto/update-attribute-value.input';
import { AttributeValueDto } from '../attribute/dto/attributeValueDto';
@Injectable()
export class ValueService {

  constructor(
    private readonly compressionService: CompressionService,
    private readonly decompressionService: DecompressionService,
    private readonly rabbitMQService: RabbitMQService, 
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}
  async paginate(indexValueInput: IndexValueInput): Promise<PaginationValueResponse> {
    indexValueInput.boot();
    const cacheKey = `values_${JSON.stringify(indexValueInput)}`;
  
    const cachedData = await this.cacheManager.get<string>(cacheKey);
  
    if (cachedData) {
      const decompressedData : PaginationValueResponse = 
      this.decompressionService.decompressData(cachedData);
 
      return decompressedData;

    }

    const pattern = 'pagination_values';
    
    const payload = { indexValueInput };

    const compressedPayload = this.compressionService.compressData(payload);

    let result = await this.rabbitMQService.send(pattern, { data: compressedPayload });

    await this.cacheManager.set(cacheKey, result,CacheTTL.ONE_DAY);

    const decompressedResult : PaginationValueResponse = this.decompressionService.decompressData(result);
   
    return decompressedResult;
  }

  async update(
    id: number,
    updateAttributeValueInput: UpdateAttributeValueInput,
  ): Promise<boolean> {
    try {
      const cacheKey = `product_{id:${updateAttributeValueInput.productId}}`;
      const keyExists = await this.cacheManager.get(cacheKey);
      if (keyExists) {
        await this.cacheManager.del(cacheKey);
      }
      const pattern = 'update_attribuite_value';
      
      const payload = { updateAttributeValueInput };
  
      const compressedPayload = this.compressionService.compressData(payload);
  
      this.rabbitMQService.send(pattern, { data: compressedPayload });
  
      return true;
    }catch(e){
      console.log('update aatibuites',e)
      return false
    }
    

   
  }

  async updateAttribuitesValue(
    id: number,
    value: string,
  ): Promise<boolean> {
    try {
     
      const pattern = 'update_value_service';
      
      const payload = { id,value };
  
      const compressedPayload = this.compressionService.compressData(payload);
  
      this.rabbitMQService.send(pattern, { data: compressedPayload });
  
      return true;
    }catch(e){
      console.log('update aatibuites',e)
      return false
    }
    

   
  }

  async remove(id: number): Promise<boolean> {
    try {

      const pattern = 'remove_attribuite_value';
      
      const payload = { id };
  
      const compressedPayload = this.compressionService.compressData(payload);
  
      let result = await this.rabbitMQService.send(pattern, { data: compressedPayload });
  
      const decompressedResult  = this.decompressionService.decompressData(result);

      const cacheKey = `product_{id:${decompressedResult}}`;
      const keyExists = await this.cacheManager.get(cacheKey);
      if (keyExists) {
        await this.cacheManager.del(cacheKey);
      }
      return true;
    }catch(e){
      console.log('update aatibuites',e)
      return false
    }
   
  }

  async create(
    createSingleValueInput: CreateSingleValueInput,
  ): Promise<ValueDto> {
    const payload = { createSingleValueInput };

    const compressedPayload = this.compressionService.compressData(payload);

    let result = await this.rabbitMQService.send('create_attribuite_value', { data: compressedPayload });

    const decompressedResult : ValueDto = this.decompressionService.decompressData(result);
   
    return decompressedResult;
  }

  // async create(createBrandInput: CreateBrandInput): Promise<brandDto> {
    
  //   try {
  //     const pattern = 'create_brand';
  //     const payload = { createBrandInput };
  //     const compressedPayload = this.compressionService.compressData(payload);
      
  //     const result = await this.rabbitMQService.send(pattern, { data: compressedPayload });

  //     return this.decompressionService.decompressData(result);
  //   } catch (error) {
       
  //     throw new Error('Brand with the same name or name_en already exists');
      
  //   }

  // }
  // async findOne(id: number, slug?: string): Promise<brandDto>{
  //   const cacheKey = `brand_{id:${id}}`;
  //   const cachedData = await this.cacheManager.get<string>(cacheKey);
  
  //   if (cachedData) {
  //     const decompressedData : brandDto = 
  //     this.decompressionService.decompressData(cachedData);
 
  //     return decompressedData;
  //   }
  //   const pattern = 'find_one_brand' ;
  //   const payload = { id };

  //   const compressedPayload = this.compressionService.compressData(payload);

  //   let result = await this.rabbitMQService.send(pattern, { data: compressedPayload });

  //   await this.cacheManager.set(cacheKey, result,CacheTTL.ONE_WEEK);
    
  //   const decompressedResult = this.decompressionService.decompressData(result);

  //   return decompressedResult;
  // }


  // async remove(id: number): Promise<brandDto>{
  //   console.log('Service: Calling remove(Brand)');
  //   console.log("id", id);
  //   const pattern =  'remove_brand' ;
  //   const payload = { id };
  //   let result = await this.rabbitMQService.send(pattern, payload);

  //   return JSON.parse(result);
  // }
}
