import { Module } from '@nestjs/common';
import { GraphQLModule } from '@nestjs/graphql';
import {
  ApolloDriver,
} from "@nestjs/apollo";
import { AppResolver } from './app.service';
import { typeOrmAsyncConfig } from './typeorm.config';
import { TypeOrmModule } from "@nestjs/typeorm";
import { CompressionService } from './compression.service';
import { DecompressionService } from './decompression.service';
import { UsersModule } from './users/users.module';
import { ConfigModule } from "@nestjs/config";
import { RabbitMQModule } from './rabbit-mq.module';
import { CronModule } from './cron/cron.module';
import { ScheduleModule } from '@nestjs/schedule';
import { AssetModule } from './asset/asset.module';
import { JobModule } from './job/jobs.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync(typeOrmAsyncConfig),
    GraphQLModule.forRoot({
      driver: ApolloDriver,
      autoSchemaFile: true,
      introspection: true,
      playground: true,
      context: ({ req }) => {
        // console.log('Request object:', req.body.query);
        return { req };
      },
    }),
   RabbitMQModule,
   JobModule,
   UsersModule,
   ScheduleModule.forRoot(),
   CronModule,
   AssetModule,
  ],
  providers: [AppResolver,CompressionService, DecompressionService],
  exports: [CompressionService, DecompressionService],

})
export class AppModule {}
