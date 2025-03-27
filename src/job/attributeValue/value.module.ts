import { Module } from "@nestjs/common";
import { DecompressionService } from "src/decompression.service";
import { CompressionService } from "src/compression.service";
import { RabbitMQService } from "src/rabbit-mq.service";
import { RabbitMQModule } from "src/rabbit-mq.module";
import { ValueResolver } from "./value-resolver";
import { ValueService } from "./value.service";

@Module({
  imports: [RabbitMQModule], 
  providers: [
      ValueResolver,
      ValueService,
      CompressionService,
      DecompressionService,
      RabbitMQService
  ],
})
export class ValueModule {}
