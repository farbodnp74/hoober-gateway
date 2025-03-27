import { Module } from "@nestjs/common";
import { jobResolver } from "./job-resolver";
import { jobService } from "./job.service";
import { CompressionService } from "src/compression.service";
import { DecompressionService } from "src/decompression.service";
import { RabbitMQService } from "src/rabbit-mq.service";
import { RabbitAssetsService } from "src/rabbit-asset.service";
import { RabbitLogsService } from "src/rabbit-log.service";



@Module({
  providers: [
    jobResolver,
    jobService,
    CompressionService,
    DecompressionService,
    RabbitMQService,
    RabbitAssetsService,
    RabbitLogsService
  ],
})
export class ProductSinModule {}
