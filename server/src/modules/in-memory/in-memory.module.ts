import { Module } from '@nestjs/common';
import { redisClientProvider } from './in-memory.providers';
import { InMemoryRepository } from './in-memory.repository';

@Module({
  providers: [InMemoryRepository, redisClientProvider],
  exports: [InMemoryRepository],
})
export class InMemoryModule {}
