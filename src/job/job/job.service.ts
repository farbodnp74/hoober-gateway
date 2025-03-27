import { ClientProxy } from '@nestjs/microservices';
import { jobDTO } from './dto/jobDTO';
import { PaginationjobResponse } from './dto/pagination-job.response';
import { IndexjobInput } from './dto/index-job.input';
import { CompressionService } from 'src/compression.service';
import { DecompressionService } from 'src/decompression.service';
import { RabbitMQService } from 'src/rabbit-mq.service';
import { CACHE_MANAGER } from "@nestjs/cache-manager";
import { Inject, Injectable } from "@nestjs/common";
import { Cache } from "cache-manager";
import { CacheTTL } from 'src/base/utilities/cache-ttl.util';
import { RabbitAssetsService } from 'src/rabbit-asset.service';
import { AttributeValueDto } from '../attribute/dto/attributeValueDto';
import { RabbitSellersService } from 'src/rabbit-seller.service';
import { OptionDTO } from '../option/dto/optionDTO';
import { CreatejobInput } from './dto/create-job.input';
import { User } from 'src/users/user/entities/user.entity';
import { RabbitLogsService } from 'src/rabbit-log.service';
import { UpdatejobInput } from './dto/update-jop.input';
import { PriceInfoDTO } from 'src/seller/price/dto/price-info-input';
import { IsCacheEnabled } from 'src/base/cache.decorator';
import { MessageEnum } from './enums/message.enum';
import { AuthorizationService } from 'src/users/authorization/authorization.service';

@Injectable()
export class jobService {
  private jobService: ClientProxy;

  constructor(
    private readonly compressionService: CompressionService,
    private readonly decompressionService: DecompressionService,
    private readonly rabbitMQService: RabbitMQService,
    private authorizationService: AuthorizationService,
    private readonly rabbitAssetsService: RabbitAssetsService,  
    private readonly rabbitSellersService: RabbitSellersService, 
    private readonly rabbitLogsService: RabbitLogsService, 
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async AddView(id:number,type:string){
    try {
      const payload = { id ,type };
      const compressedPayload = this.compressionService.compressData(payload);
        
      this.rabbitLogsService.send('add_view', { data: compressedPayload });
    } catch(e){
      console.log('err add view',e)
    }
  }
  async pagination(indexjobInput: IndexjobInput,user:User): Promise<PaginationjobResponse> {
    indexjobInput.boot();
    let admin = false
    if (await this.authorizationService.setUser(user).hasRole("admin")) {
      admin = true
    }
    const cacheKey = `produtcs_${JSON.stringify(indexjobInput)}`;
    if(admin){
      
  
      const cachedData = await this.cacheManager.get<string>(cacheKey);
    
      if (cachedData) {
        const decompressedData : PaginationjobResponse = 
        this.decompressionService.decompressData(cachedData);
   
        return decompressedData;
  
      }
    }


    const pattern = 'pagination_job';
    
    const payload = { indexjobInput };

    const compressedPayload = this.compressionService.compressData(payload);

    let result = await this.rabbitMQService.send(pattern, { data: compressedPayload });

    const decompressedResultData = this.decompressionService.decompressData(result);

    const jobIds = await this.extractjobIds(decompressedResultData[0]);
    const jobParentIds = await this.extractjobParentIds(decompressedResultData[0]);

    const promises = [
      this.sendImageMessage(jobIds,true),
      this.getNewPrices(jobIds,true),
      this.getOptions(jobParentIds,true),
      this.getVarient(jobParentIds,true),
      indexjobInput.moreDetail ? this.getLowestPrices(jobIds) : Promise.resolve([]),
      indexjobInput.moreDetail ? this.getHighestPrices(jobIds) : Promise.resolve([]),
      this.getParent(jobParentIds,true) 
    ];

    const [jobImages, newPrices,optionsData,varientData, lowestPrices,highestPrice,parentdata] = await Promise.all(promises);
    
    const jobs = decompressedResultData[0].map((job: jobDTO, index: number) => {
      const correspondingImageUrl = jobImages.find(asset => asset.jobId === job.id) || null;
      const correspondingAmount = newPrices.find(price => price.jobId === job.id) || null;
      const corresparentData = parentdata.find(parent => parent.id === job.parentId) || null;
      const correspondingLowestAmount = lowestPrices.find(price => price.jobId === job.id) || null;
      const correspondingHighesttAmount = highestPrice.find(price => price.jobId === job.id) || null;
    
      let options: OptionDTO[] = [];

      if (optionsData) {
        // Group options by their attribute name and parent job id
        const groupedOptions = optionsData.reduce((acc, option) => {
          const key = `${option.attribute_name}:${option.parentjobId}`;
          const existingOption = acc[key];
          if (existingOption) {
            existingOption.variantValues.push({
              jobId: option.job_id,
              value: option.varient_value
            });
          } else {
            acc[key] = {
              id: option.option_id,
              attribute: option.attribute_name,
              variantValues: [{
                jobId: option.job_id,
                value: option.varient_value
              }]
            };
          }
          return acc;
        }, {});
      
        options = Object.values(groupedOptions).map(option => new OptionDTO(option));
      }
      let price = []
      if(correspondingHighesttAmount){
        price.push(correspondingHighesttAmount)
      }
      if(correspondingLowestAmount){
        price.push(correspondingLowestAmount)
      }
      if(correspondingAmount){
        price.push(correspondingAmount)
      }
      return {
        ...job,
        imageUrl: correspondingImageUrl ? [correspondingImageUrl] : [],
        price: price,
        parent : corresparentData,
        options: options,
        varient: varientData,
      };
      
    });
    
    const decompressedResult: PaginationjobResponse =
        PaginationjobResponse.make(indexjobInput, decompressedResultData[1], jobs);
    
    if(admin){
      await this.cacheManager.set(cacheKey, this.compressionService.compressData(decompressedResult),CacheTTL.THREE_DAYS);
    }
    
    return decompressedResult;
    
  }
  async update(
    id: number,
    updatejobInput: UpdatejobInput,
  ): Promise<jobDTO> {
    const cacheKey = `job_{id:${id}}`;
    const keyExists = await this.cacheManager.get(cacheKey);
    if (keyExists) {
      await this.cacheManager.del(cacheKey);
    }
    const payload = { updatejobInput };

    const compressedPayload = this.compressionService.compressData(payload);

    let result = await this.rabbitMQService.send('update_job', { data: compressedPayload });
    const decompressedResultData = this.decompressionService.decompressData(result);
    return decompressedResultData;
  }
  async extractjobIds(result: any): Promise<number[]> {
    return result.map(item => item.id);
  }
  async extractjobParentIds(result: any): Promise<number[]> {
    return result.map(item => item.parentId);
  }

  private async sendImageMessage(jobIds: number[],isCacheEnabled:boolean) {
    const cacheKey = `jobImage_{ids:${jobIds}}`;
    if(isCacheEnabled){
      const cachedData = await this.cacheManager.get<string>(cacheKey);
  
      if (cachedData) {
        return cachedData;
      }
    
    }  

    const response = await this.rabbitAssetsService.send('getImagejob', { jobIds });
    if(isCacheEnabled){
      await this.cacheManager.set(cacheKey, response,CacheTTL.ONE_DAY);
    }
  
    return response;
  }
  private async getNewPrices(jobIds: number[],isCacheEnabled:boolean) {
    const cacheKey = `newst_price_{ids:${jobIds}}`;
    if(isCacheEnabled){
    
      const cachedData = await this.cacheManager.get<string>(cacheKey);
  
      if (cachedData) {
        const decompressedResultData = this.decompressionService.decompressData(cachedData)
        
        return decompressedResultData;
      }
    }
      
   
    const response = await this.rabbitSellersService.send('getNewPriceFromIds', { jobIds });
    const decompressedResultData = this.decompressionService.decompressData(response)

    const formattedPrices: PriceInfoDTO[] = decompressedResultData.map(price => {
    
      if (price.amountwithdiscount) {
          return {
              jobId:price.jobId,
              type: 'NEWEST',
              value: {
                  discount: {
                      calculated_price: price.amountwithdiscount,
                      orginal_price: price.orginal ? price.orginal : '0',
                      type: 'PERCENTAGE',
                      value: price.percentdiscount ? price.percentdiscount : '0',
                  },
                  createdAt: price.createdAt,
                  amount: price.amount,
                  message : price.isExpired ? MessageEnum.EXPIRED : ''
              },
          };
      } else {
          return {
              jobId:price.jobId,
              type: 'NEWEST',
              value: {
                  discount: null,
                  createdAt: price.createdAt,
                  amount: price.amount,
                  message : price.isExpired ? MessageEnum.EXPIRED : ''
              },
          };
      }
  });
  if(isCacheEnabled){
    await this.cacheManager.set(cacheKey,this.compressionService.compressData(formattedPrices)
    ,CacheTTL.THREE_DAYS);
  
  }

    return formattedPrices;
  }




  private async getOptions(jobParentIds: number[],isCacheEnabled) {
    const cacheKey = `options_{ids:${jobParentIds}}`;
    
    if(isCacheEnabled){
      const cachedData = await this.cacheManager.get<string>(cacheKey);
  
      if (cachedData) {
        const decompressedResultData = this.decompressionService.decompressData(cachedData)
        return decompressedResultData;
      }
    
    }

    const response = await this.rabbitMQService.send('getOptionsFromIds', { jobParentIds });
    const decompressedResultData = this.decompressionService.decompressData(response)


    if(isCacheEnabled){
      await this.cacheManager.set(cacheKey, response,CacheTTL.THREE_DAYS);
    }
 
    return decompressedResultData;
  }

  private async getVarient(jobParentIds: number[],isCacheEnabled:boolean)  {
    const cacheKey = `varient_{ids:${jobParentIds}}`;
    if(isCacheEnabled){
    
      const cachedData = await this.cacheManager.get<string>(cacheKey);
  
      if (cachedData) {
        const decompressedResultData = this.decompressionService.decompressData(cachedData)
        return decompressedResultData;
      }
    }
      
   
    const response = await this.rabbitMQService.send('getVarientFromIds', { jobParentIds });
    const decompressedResultData = this.decompressionService.decompressData(response)
   if(isCacheEnabled){
    await this.cacheManager.set(cacheKey, response,CacheTTL.THREE_DAYS);
   }
    
    return decompressedResultData;
  }

  private async getParent(jobParentIds: number[],isCacheEnabled:boolean) {
    const cacheKey = `parent_{ids:${jobParentIds}}`;
    if(isCacheEnabled){
      const cachedData = await this.cacheManager.get<string>(cacheKey);
  
      if (cachedData) {
        const decompressedResultData = this.decompressionService.decompressData(cachedData)
        return decompressedResultData;
      }
    
    }
   
    const response = await this.rabbitMQService.send('getParentFromIds', { jobParentIds });
    const decompressedResultData = this.decompressionService.decompressData(response)

    if(isCacheEnabled){
      await this.cacheManager.set(cacheKey, response,CacheTTL.THREE_DAYS);
    }
    return decompressedResultData;
  }

  private async getLowestPrices(jobIds: number[]) {
    const cacheKey = `lowest_price_{ids:${jobIds}}`;
      
    const cachedData = await this.cacheManager.get<string>(cacheKey);
  
    if (cachedData) {
      const decompressedResultData = this.decompressionService.decompressData(cachedData)
      return decompressedResultData;
    }
    const response = await this.rabbitSellersService.send('getLowestPricesFromIds', { jobIds });
    const decompressedResultData = this.decompressionService.decompressData(response)

    const formattedPrices: PriceInfoDTO[] = decompressedResultData.map(price => {
      if (price.amountwithdiscount) {
          return {
              jobId:price.jobId,
              type: 'LOWEST',
              value: {
                  discount: {
                      calculated_price: price.amountwithdiscount,
                      orginal_price: price.orginal ? price.orginal : '0',
                      type: 'PERCENTAGE',
                      value: price.percentdiscount ? price.percentdiscount : '0',
                  },
                  createdAt: price.createdAt,
                  amount: price.amount,
                  message : price.isExpired ? MessageEnum.EXPIRED : ''
              },
          };
      } else {
          return {
              jobId:price.jobId,
              type: 'LOWEST',
              value: {
                  discount: null,
                  createdAt: price.createdAt,
                  amount: price.amount,
                  message : price.isExpired ? MessageEnum.EXPIRED : ''
              },
          };
      }
  });
    await this.cacheManager.set(cacheKey,this.compressionService.compressData(formattedPrices)
    ,CacheTTL.THREE_DAYS);
    return formattedPrices;
  }

  private async getHighestPrices(jobIds: number[]) {
    const cacheKey = `highest_price_{ids:${jobIds}}`;
      
    const cachedData = await this.cacheManager.get<string>(cacheKey);
  
    if (cachedData) {
      const decompressedResultData = this.decompressionService.decompressData(cachedData)
      return decompressedResultData;
    }
    const response = await this.rabbitSellersService.send('getHighestPricesFromIds', { jobIds });
    const decompressedResultData = this.decompressionService.decompressData(response)

    const formattedPrices: PriceInfoDTO[] = decompressedResultData.map(price => {
      if (price.amountwithdiscount) {
          return {
            jobId:price.jobId,
              type: 'HIGHEST',
              value: {
                  discount: {
                      calculated_price: price.amountwithdiscount,
                      orginal_price: price.orginal ? price.orginal : '0',
                      type: 'PERCENTAGE',
                      value: price.percentdiscount ? price.percentdiscount : '0',
                  },
                  createdAt: price.createdAt,
                  amount: price.amount,
                  message : price.isExpired ? MessageEnum.EXPIRED : ''
              },
          };
      } else {
          return {
              jobId:price.jobId,
              type: 'HIGHEST',
              value: {
                  discount: null,
                  createdAt: price.createdAt,
                  amount: price.amount,
                  message : price.isExpired ? MessageEnum.EXPIRED : ''
              },
          };
      }
  });
    await this.cacheManager.set(cacheKey,this.compressionService.compressData(formattedPrices)
    ,CacheTTL.THREE_DAYS);
    return formattedPrices;
  }

  async findOne(id: number, isCacheEnabled:boolean): Promise<jobDTO>{
      try {
          this.AddView(id,'job')
          const cacheKey = `job_{id:${id}}`;
  
          if (isCacheEnabled) {
            const cachedData = await this.cacheManager.get<string>(cacheKey);
            if (cachedData) {
                const decompressedData: jobDTO = this.decompressionService.decompressData(cachedData);
                return decompressedData;
  
            }
            
          }

          const pattern = 'find_one_job';
          const attributesPattern = 'find_one_job_attribute';
          const payload = { id };
          const compressedPayload = this.compressionService.compressData(payload);
          
          const [result, attributesResult,imageResult,newPrices] = await Promise.all([
              this.rabbitMQService.send(pattern, { data: compressedPayload }),
              this.rabbitMQService.send(attributesPattern, { data: compressedPayload }),
              this.rabbitAssetsService.send('getImagejob', { jobIds:[id] }),
              this.getNewPrices([id],true),
          ]);
          
          // Decompress data
          const decompressedResult = this.decompressionService.decompressData(result);
          const decompressedAttributesResult = this.decompressionService.decompressData(attributesResult);
          const attributes: AttributeValueDto[] = await this.mapjobAttributes(decompressedAttributesResult);

          let options = [];

          const [optionsData, varient,parent] = await Promise.all([
            this.getOptions([decompressedResult.parentId],true),
            this.getVarient([decompressedResult.parentId],true),
            this.getParent([decompressedResult.parentId],true),
        ]);

          if (optionsData) {
            options = Object.values(optionsData.reduce((acc, option) => {
              if (option.parentjobId === decompressedResult.parentId) {
                const key = `${option.attribute_name}:${option.parentjobId}`;
                const existingOption = acc[key];
                if (existingOption) {
                  existingOption.variantValues.push({
                    jobId: option.job_id,
                    value: option.varient_value
                  });
                } else {
                  acc[key] = {
                    id: option.option_id,
                    attribute: option.attribute_name,
                    variantValues: [{
                      jobId: option.job_id,
                      value: option.varient_value
                    }]
                  };
                }
              }
              return acc;
            }, {}));
          }
          for (const varientItem of varient) {
            const varientOptions = optionsData.filter(option => option.job_id === varientItem.id);
            const varientOptionsMapped = varientOptions.map(option => ({
              id: option.option_id,
              attribute: option.attribute_name,
              variantValues: [{
                jobId: varientItem.id,
                value: option.varient_value,
              }],
            }));
            varientItem.options = varientOptionsMapped;
          }
          const correspondingAmount = newPrices.find(price => price.jobId === id) || null;
          const jobDto: jobDTO = {
              id: decompressedResult.id,
              offers_count:decompressedResult.offers_count,
              name: decompressedResult.name,
              description: decompressedResult.description,
              sku: decompressedResult.sku,
              // price: {
              //   values : null
              //   type : 'NEWEST'
              //   // lowest_price: null,
              //   // highest_price: null,
              //   // newest_price: correspondingAmount
              // },
              price:[],
              options: options,
              parentId:decompressedResult.parentId,
              varient: varient,
              rating:decompressedResult.rating,
              imageUrl : imageResult,
              parent: parent[0], 
              status: decompressedResult.status,
              attributes: attributes
          };
          if (isCacheEnabled){
            await this.cacheManager.set(cacheKey,this.compressionService.compressData (jobDto), CacheTTL.THREE_DAYS);
          
          }
        
          return jobDto;
      } catch (error) {
          // Handle errors
          throw new Error(`Error in findOne: ${error}`);
      }

  }

  async mapjobAttributes(data: any[]): Promise<AttributeValueDto[]> {
    return data.map(item => {
      return new AttributeValueDto(item.id,item.attribute.name, item.value.value);
    });
  }

  async similarjob(id: number): Promise<jobDTO[]> {
    const cacheKey = `similar_job_{id:${id}}`;
    const cachedData = await this.cacheManager.get<string>(cacheKey);
  
    if (cachedData) {
      const decompressedData : jobDTO[] = 
      this.decompressionService.decompressData(cachedData);
 
      return decompressedData;
    }
    const pattern = 'similar_job' ;
    const payload = { id };

    const compressedPayload = this.compressionService.compressData(payload);

    let result = await this.rabbitMQService.send(pattern, { data: compressedPayload });
    const decompressedResultData = this.decompressionService.decompressData(result);
    const jobIds = await this.extractjobIds(decompressedResultData);

    const promises = [
      this.sendImageMessage(jobIds,true),
      this.getNewPrices(jobIds,true),
    ];

    const [jobImages, newPrices] = await Promise.all(promises);
    
    const jobs = decompressedResultData.map((job: jobDTO, index: number) => {

      const correspondingImageUrl = jobImages.find(asset => asset.jobId === job.id) || null;
      const correspondingAmount = newPrices.find(price => price.jobId === job.id) || null;
  
    
      let price = []
      if(correspondingAmount){
        price.push(correspondingAmount)
      }
      return {
        ...job,
        imageUrl: correspondingImageUrl ? [correspondingImageUrl] : [],
        price: price
      };
    });

    await this.cacheManager.set(cacheKey, this.compressionService.compressData(jobs),
    CacheTTL.ONE_WEEK);

    return jobs;

  }
  async remove(id: number): Promise<boolean>{
    const cacheKey = `job_{id:${id}}`;
    const keyExists = await this.cacheManager.get(cacheKey);
    if (keyExists) {
      await this.cacheManager.del(cacheKey);
    }
    const pattern = 'remove_job' ;
    const payload = { id };
    const compressedPayload = this.compressionService.compressData(payload);

    let result = this.rabbitMQService.send(pattern, { data: compressedPayload });

    return true;
  }

  async createVarientFromExistjob(
    orginal_produtc_id: number,
    similar_produtc_id:number,
    attribuite_id : number,
    similar_value_id : number,
    orginal_value_id : number
  
  ): Promise<jobDTO>{
    try{
      const payload = { 
        orginal_produtc_id,
        similar_produtc_id,
        attribuite_id,
        similar_value_id,
        orginal_value_id 
      };

      const compressedPayload = this.compressionService.compressData(payload);

       const pattern = 'create_varient_exist_job' ;
       let result = await this.rabbitMQService.send(pattern, { data: compressedPayload });
       const decompressedResultData = this.decompressionService.decompressData(result);


      const promises = [
        this.createOtions(attribuite_id,orginal_value_id,orginal_produtc_id,decompressedResultData.parentId),
        this.createOtions(attribuite_id,similar_value_id,similar_produtc_id,decompressedResultData.parentId),
      ];
  
      const [res1,res2] = await Promise.all(promises);
      console.log(res1,res2)
      return decompressedResultData

    }catch(e){
      console.log('err in createVarientFromExistjob ',e)
    }
    
  }
  async createOtions(att_id : number,value_id: number,job_id : number,parent_id:number): Promise<boolean> {

    try {
      const createOptionDto =  {
       'attribuiteId': att_id, 
       'valueIds': [value_id], 
       'jobId': job_id,
       'parentjobId' : parent_id
      }
      const pattern = 'create_option_manual';
      const payload = { createOptionDto };
      const compressedPayload = this.compressionService.compressData(payload);
      
      const result = await this.rabbitMQService.send(pattern, { data: compressedPayload });
      return result ;
    } catch (error) {
      console.log('e create_option_manual ',error)
       return false
    }

  }
  async create(createjobInput: CreatejobInput,user:User): Promise<jobDTO> {
    try{
      const pattern = { cmd: 'create_job' };
      const payload = { createjobInput };
      let result = await this.jobService.send(pattern, payload).toPromise();
  
      const decompressedResult = this.decompressionService.decompressData(result);
  
      return decompressedResult;
    }catch(e){
     console.log('err createjobInput ',e)
    }
    
  }
}
