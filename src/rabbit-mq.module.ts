import { Module } from '@nestjs/common';
import { RabbitMQService } from './rabbit-mq.service';
import { RabbitAssetsService } from './rabbit-asset.service';
import { RabbitLogsService } from './rabbit-log.service';

@Module({
  controllers: [],
  providers: [RabbitMQService,RabbitAssetsService,RabbitLogsService],
  exports: [RabbitMQService,RabbitAssetsService,RabbitLogsService],
})
export class RabbitMQModule {}