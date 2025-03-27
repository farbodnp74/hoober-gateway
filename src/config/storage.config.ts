import { ConfigModule, ConfigService } from "@nestjs/config";

export const storageAsyncConfig = {
  imports: [ConfigModule],
  inject: [ConfigService],
  isGlobal: true,
  useFactory: async (configService: ConfigService) => ({
    endPoint: configService.get("STORAGE_MINIO_ENDPOINT"),
    port: +configService.get("STORAGE_MINIO_PORT"),
    useSSL: configService.get("STORAGE_MINIO_SSL") === "true",
    accessKey: configService.get("STORAGE_MINIO_ACCESS_KEY"),
    secretKey: configService.get("STORAGE_MINIO_SECRET_KEY"),
  }),
};
