import { BullModule } from '@nestjs/bullmq';
import { Module, forwardRef } from '@nestjs/common';
import { BOT_MOVES_MANAGER_QUEUE_NAME } from 'src/common/constants';
import { GamesMovesModule } from '../games-moves/games-moves.module';
import { BotsService } from './bots.service';
import { BotMovesManagerProcessor } from './processors/bot-moves-manager.processor';
import { GamesModule } from '../games/games.module';

@Module({
  imports: [
    forwardRef(() => GamesModule),
    forwardRef(() => GamesMovesModule),
    BullModule.registerQueueAsync({
      name: BOT_MOVES_MANAGER_QUEUE_NAME,
    }),
  ],
  providers: [BotsService, BotMovesManagerProcessor],
  exports: [BotsService],
})
export class BotsModule {}
