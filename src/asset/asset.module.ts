import { Module } from '@nestjs/common';
import { AssetService } from './asset.service';
import { AssetResolver } from './asset.resolver';
import { CompressionService } from 'src/compression.service';
import { DecompressionService } from 'src/decompression.service';
import { RabbitAssetsService } from 'src/rabbit-asset.service';
import { PublicFileController } from './public-file.controller';
import { NestMinioModule } from "nestjs-minio";
import { storageAsyncConfig } from "src/config/storage.config";
@Module({
  imports: [NestMinioModule.registerAsync(storageAsyncConfig)],
  controllers: [PublicFileController],
  providers: [
    AssetService, 
    AssetResolver,
    CompressionService,
    DecompressionService,
    RabbitAssetsService
  ]
})
export class AssetModule {}
