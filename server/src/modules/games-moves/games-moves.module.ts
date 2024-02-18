import { BullModule } from '@nestjs/bullmq';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NEW_MOVES_QUEUE_NAME } from 'src/common/constants';
import { GameMoveEntity } from './game-move.entity';
import { GamesMovesRepository } from './games-moves.repository';
import { GamesMovesService } from './games-moves.service';
import { GamesMovesGateway } from './gateways/games-moves.gateway';
import { NewMovesProcessor } from './processors/new-moves.processor';
import { InMemoryModule } from '../in-memory/in-memory.module';
import { GamesModule } from '../games/games.module';
import { GamesMovesController } from './controllers/games-moves.controller';

@Module({
  controllers: [GamesMovesController],
  imports: [
    TypeOrmModule.forFeature([GameMoveEntity]),
    BullModule.registerQueueAsync({
      name: NEW_MOVES_QUEUE_NAME,
    }),
    InMemoryModule,
    GamesModule,
  ],
  providers: [
    GamesMovesService,
    GamesMovesRepository,
    GamesMovesGateway,
    NewMovesProcessor,
  ],
})
export class GamesMovesModule {}
