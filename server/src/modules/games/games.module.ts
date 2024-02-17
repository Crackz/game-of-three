import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JOIN_GAMES_QUEUE_NAME } from 'src/common/constants';
import { InMemoryModule } from '../in-memory/in-memory.module';
import { GameEntity } from './game.entity';
import { GamesRepository } from './games.repository';
import { GamesService } from './games.service';
import { JoinGamesGateway } from './gateways/join-games.gateway';
import { JoinGamesProcessor } from './processors/join-games.processor';
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    TypeOrmModule.forFeature([GameEntity]),
    BullModule.registerQueueAsync({
      name: JOIN_GAMES_QUEUE_NAME,
    }),
    InMemoryModule,
  ],
  providers: [
    JoinGamesGateway,
    GamesRepository,
    GamesService,
    JoinGamesProcessor,
  ],
})
export class GamesModule {}
