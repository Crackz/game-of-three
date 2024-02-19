import { Injectable } from '@nestjs/common';
import { BotNewMoveJobMessage } from './interfaces/bot-moves-manager.interface';
import { BOT_MOVES_MANAGER_QUEUE_NAME } from 'src/common/constants';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from 'src/common/env/environment-variables';

@Injectable()
export class BotsService {
  constructor(
    @InjectQueue(BOT_MOVES_MANAGER_QUEUE_NAME)
    private readonly botMovesManagerQueue: Queue,
    private readonly configService: ConfigService<EnvironmentVariables>,
  ) {}
  async tryToMakeBotNewMove(gameId: number) {
    const botNewMoveJobMessage: BotNewMoveJobMessage = {
      gameId,
    };

    await this.botMovesManagerQueue.add('*', botNewMoveJobMessage);
  }
}
