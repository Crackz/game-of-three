import { BullModule } from '@nestjs/bullmq';
import { Module, forwardRef } from '@nestjs/common';
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
import { BotsModule } from '../bots/bots.module';

@Module({
  controllers: [GamesMovesController],
  imports: [
    TypeOrmModule.forFeature([GameMoveEntity]),
    BullModule.registerQueueAsync({
      name: NEW_MOVES_QUEUE_NAME,
    }),
    InMemoryModule,
    forwardRef(() => GamesModule),
    forwardRef(() => BotsModule),
  ],
  providers: [
    GamesMovesService,
    GamesMovesRepository,
    GamesMovesGateway,
    NewMovesProcessor,
  ],
  exports: [GamesMovesService, GamesMovesGateway],
})
export class GamesMovesModule {}
