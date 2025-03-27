import {
  CacheModuleAsyncOptions,
  CacheModuleOptions,
  CacheStore,
} from "@nestjs/cache-manager";
import { ConfigModule, ConfigService } from "@nestjs/config";
// import { redisStore } from "cache-manager-redis-store";
import { CacheTTL } from "src/base/utilities/cache-ttl.util";

export const cacheAsyncConfig: CacheModuleAsyncOptions = {
  isGlobal: true,
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: async (
    configService: ConfigService,
  ): Promise<CacheModuleOptions> => ({
    // store: redisStore as unknown as CacheStore,
    url: `redis://:g90pM89O@${configService.get("REDIS_HOST")}:${configService.get("REDIS_PORT")}`,
    ttl: CacheTTL.ONE_WEEK,
    max: 30, // Adjust based on performance testing
    min: 10,  // Minimum number of connections in the pool
  }),
};
