import { Module } from "@nestjs/common";
import { ImagesResolver } from "./images.resolver";
import { ImagesService } from "./images.service";
import { CompressionService } from "src/compression.service";
import { DecompressionService } from "src/decompression.service";
import { RabbitMQService } from "src/rabbit-mq.service";
import { RabbitAssetsService } from "src/rabbit-asset.service";
import { RabbitLogsService } from "src/rabbit-log.service";

@Module({
  providers: [
    ImagesResolver,
     ImagesService,
     CompressionService,
     DecompressionService,
     RabbitMQService,
     RabbitAssetsService,
     RabbitLogsService
    ],
})
export class ImagesModule {}
