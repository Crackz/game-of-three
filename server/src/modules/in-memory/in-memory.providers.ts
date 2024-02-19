import { FactoryProvider } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';
import { REDIS_CLIENT_TOKEN } from 'src/common/constants';
import { EnvironmentVariables } from 'src/common/env/environment-variables';

export const redisClientProvider: FactoryProvider<Redis> = {
  provide: REDIS_CLIENT_TOKEN,
  useFactory: (configService: ConfigService<EnvironmentVariables>) => {
    const redisInstance = new Redis({
      host: configService.get('REDIS_HOST'),
      port: configService.get('REDIS_PORT'),
    });

    redisInstance.on('error', (e) => {
      throw new Error(`Redis connection failed: ${e}`);
    });

    return redisInstance;
  },
  inject: [ConfigService],
};
