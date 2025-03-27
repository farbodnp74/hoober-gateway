import { ConfigModule, ConfigService } from "@nestjs/config";
import {
  TypeOrmModuleAsyncOptions,
  TypeOrmModuleOptions,
} from "@nestjs/typeorm";


export const typeOrmAsyncConfig: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (
    configService: ConfigService,
  ): Promise<TypeOrmModuleOptions> => {
    return {
      type: "postgres",
      host: configService.get("DB_HOST", "database"),
      port: parseInt(configService.get("DB_PORT", "5432")),
      database: configService.get("DB_NAME", "v2"),
      synchronize: configService.get("DB_SYNC", "false") === "true",
      logging: configService.get("DB_QUERY_LOG", "false") === "true",
      cache: true,
      entities: [
      ],
    };
  },
};
