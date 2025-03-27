import { Module } from '@nestjs/common';
import { CronService } from './cron.service';
import { CompressionService } from 'src/compression.service';
import { DecompressionService } from 'src/decompression.service';
import { KavenegarService } from 'src/base/kavenegar/kavenegar.service';
import { KavenegarModule } from 'src/base/kavenegar/kavenegar.module';
import { ConfigModule } from 'src/config/config.module';
import { HttpModule } from '@nestjs/axios';
@Module({
  imports: [
    ConfigModule,
    HttpModule.register({
    timeout: 3000,
    maxRedirects: 5,
    }),
    KavenegarModule
  ],
  providers: [
    CronService,
    CompressionService,
    DecompressionService,
    KavenegarService
  ]
})
export class CronModule {}
