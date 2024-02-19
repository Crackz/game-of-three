import { Inject, Injectable, OnApplicationShutdown } from '@nestjs/common';
import { Redis } from 'ioredis';
import { REDIS_CLIENT_TOKEN } from 'src/common/constants';

@Injectable()
export class InMemoryRepository implements OnApplicationShutdown {
  constructor(
    @Inject(REDIS_CLIENT_TOKEN) private readonly redisClient: Redis,
  ) {}

  async onApplicationShutdown() {
    await this.redisClient.disconnect();
  }

  async get(key: string): Promise<string | null> {
    return this.redisClient.get(key);
  }

  async set(key: string, value: string): Promise<void> {
    await this.redisClient.set(key, value);
  }

  async delete(key: string): Promise<void> {
    await this.redisClient.del(key);
  }

  async deleteMany(keys: string[]): Promise<void> {
    await this.redisClient.del(keys);
  }

  async deleteByPattern(pattern: string) {
    const keys = await this.redisClient.keys(`${pattern}:*`);
    if (keys.length) {
      await this.redisClient.del(keys);
    }
  }

  async exists(key: string): Promise<boolean> {
    const result = await this.redisClient.exists(key);
    return result === 1;
  }

  async setWithExpiry(
    key: string,
    value: string,
    expiryInMs: number,
  ): Promise<void> {
    await this.redisClient.set(key, value, 'EX', expiryInMs);
  }
}
