import { Module } from "@nestjs/common";
import { AttribuiteResolver } from "./attribuite-resolver";
import { DecompressionService } from "src/decompression.service";
import { CompressionService } from "src/compression.service";
import { RabbitMQService } from "src/rabbit-mq.service";
import { RabbitMQModule } from "src/rabbit-mq.module";
import { AttribuiteService } from "./attribuite.service";

@Module({
  imports: [RabbitMQModule], 
  providers: [
      AttribuiteResolver,
      AttribuiteService,
      CompressionService,
      DecompressionService,
      RabbitMQService
  ],
})
export class AttribuiteModule {}
