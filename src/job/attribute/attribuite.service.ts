import { IndexAttribuiteInput } from './dto/index-attribuite.input';
import { PaginationAttribuiteResponse } from './dto/pagination-attribuite.response';
import { CompressionService } from 'src/compression.service';
import { DecompressionService } from 'src/decompression.service';
import { RabbitMQService } from 'src/rabbit-mq.service';
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable, NotFoundException } from "@nestjs/common";
import { Cache } from "cache-manager";
import { CacheTTL } from 'src/base/utilities/cache-ttl.util';
import { CreateSingleAttributeInput } from './dto/create-single-attribute.input';
import { AttributeDto } from './dto/attributeDto';
import { UpdateSingleAttributeInput } from './dto/update-attribute.input';
@Injectable()
export class AttribuiteService {

  constructor(
    private readonly compressionService: CompressionService,
    private readonly decompressionService: DecompressionService,
    private readonly rabbitMQService: RabbitMQService, 
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}
  async paginate(indexAttribuiteInput: IndexAttribuiteInput): Promise<PaginationAttribuiteResponse> {
    indexAttribuiteInput.boot();
    const cacheKey = `attribuites_${JSON.stringify(indexAttribuiteInput)}`;
  
    const cachedData = await this.cacheManager.get<string>(cacheKey);
  
    if (cachedData) {
      const decompressedData : PaginationAttribuiteResponse = 
      this.decompressionService.decompressData(cachedData);
 
      return decompressedData;

    }

    const pattern = 'pagination_attribuites';
    
    const payload = { indexAttribuiteInput };

    const compressedPayload = this.compressionService.compressData(payload);

    let result = await this.rabbitMQService.send(pattern, { data: compressedPayload });

    await this.cacheManager.set(cacheKey, result,CacheTTL.ONE_DAY);

    const decompressedResult : PaginationAttribuiteResponse = this.decompressionService.decompressData(result);
   
    return decompressedResult;
  }

  async create(
    createAttributeInput: CreateSingleAttributeInput,
  ): Promise<AttributeDto> {
    const payload = { createAttributeInput };

    const compressedPayload = this.compressionService.compressData(payload);

    let result = await this.rabbitMQService.send('create_attribuite', { data: compressedPayload });

    const decompressedResult : AttributeDto = this.decompressionService.decompressData(result);
   
    return decompressedResult;
  }

  async findOne(
    id: number,
  ): Promise<AttributeDto> {
    const cacheKey = `attribuite_{id:${JSON.stringify(id)}}`;
  
    const cachedData = await this.cacheManager.get<string>(cacheKey);
  
    if (cachedData) {
      const decompressedData : AttributeDto = 
      this.decompressionService.decompressData(cachedData);
 
      return decompressedData;

    }
    const payload = { id };

    const compressedPayload = this.compressionService.compressData(payload);

    let result = await this.rabbitMQService.send('find_attribuite', { data: compressedPayload });

    const decompressedResult : AttributeDto = this.decompressionService.decompressData(result);
    await this.cacheManager.set(cacheKey, result,CacheTTL.ONE_MONTH);
    return decompressedResult;
  }

  async update(
    updateSingleAttributeInput: UpdateSingleAttributeInput,
  ): Promise<boolean> {
    const payload = { updateSingleAttributeInput };

    const compressedPayload = this.compressionService.compressData(payload);

    this.rabbitMQService.send('update_attribuite', { data: compressedPayload });
   
    return true;
  }

}
