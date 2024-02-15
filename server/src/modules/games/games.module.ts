import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JOIN_GAMES_QUEUE_NAME } from 'src/common/constants';
import { GameEntity } from './game.entity';
import { JoinGamesGateway } from './gateways/join-games.gateway';
import { GamesRepository } from './games.repository';
import { GamesService } from './games.service';
import { JoinGamesProcessor } from './processors/join-games.processor';
import { InMemoryModule } from '../in-memory/in-memory.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([GameEntity]),
    BullModule.registerQueue({
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
