import { Module } from "@nestjs/common";
import { CategoryService } from "./category.service";
import { CategoryResolver } from "./category-resolver";
import { DecompressionService } from "src/decompression.service";
import { CompressionService } from "src/compression.service";
import { RabbitMQService } from "src/rabbit-mq.service";
import { RabbitMQModule } from "src/rabbit-mq.module";

@Module({
  imports: [RabbitMQModule], 
  providers: [
    CategoryResolver,
    CategoryService,
    CompressionService,
    DecompressionService,
    RabbitMQService
  ],
})
export class CategoryModule {}
