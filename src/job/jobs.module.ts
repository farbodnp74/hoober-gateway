import { Module } from "@nestjs/common";
import { ApiGatewayService } from "./api-gateway.service";
import { CategoryModule } from "./category/category.module";
import { ProductSinModule } from "./job/job.module";
import { CompressionService } from "src/compression.service";
import { DecompressionService } from "src/decompression.service";
import { AttribuiteModule } from "./attribute/attribuite.module";
import { ValueModule } from "./attributeValue/value.module";
import { ImagesModule } from "./image/images.module";

@Module({
  imports:[
    CategoryModule,
    ProductSinModule,
    AttribuiteModule,
    ValueModule,
    ImagesModule 
  ],
  providers: [
    ApiGatewayService,
    CompressionService,
    DecompressionService
  ],
  
})
export class JobModule {}
