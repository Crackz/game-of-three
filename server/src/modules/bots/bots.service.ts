import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { Queue } from 'bullmq';
import { BOT_MOVES_MANAGER_QUEUE_NAME } from 'src/common/constants';
import { BotNewMoveJobMessage } from './interfaces/bot-moves-manager.interface';

@Injectable()
export class BotsService implements OnApplicationBootstrap {
  constructor(
    @InjectQueue(BOT_MOVES_MANAGER_QUEUE_NAME)
    private readonly botMovesManagerQueue: Queue,
  ) {}

  async onApplicationBootstrap() {
    /**
     * Remove any old bot moves job that could happen when the server crashes
     */
    const jobs = await this.botMovesManagerQueue.getJobs();
    await Promise.all(jobs.map((job) => job.remove()));
  }

  async tryToMakeBotNewMove(gameId: number) {
    const botNewMoveJobMessage: BotNewMoveJobMessage = {
      gameId,
    };

    await this.botMovesManagerQueue.add('*', botNewMoveJobMessage);
  }
}
