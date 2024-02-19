import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { JOIN_GAMES_QUEUE_NAME } from 'src/common/constants';
import { GamesService } from '../games.service';
import { GamesGateway } from '../gateways/games.gateway';
import { JoinGameJobMessage } from '../interfaces/join-games.interface';
import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';

@Processor(JOIN_GAMES_QUEUE_NAME)
export class JoinGamesProcessor extends WorkerHost {
  private logger = new Logger(JoinGamesProcessor.name);

  constructor(
    private readonly gamesGateway: GamesGateway,
    private readonly gamesService: GamesService,
  ) {
    super();
  }

  async process(job: Job<JoinGameJobMessage>): Promise<any> {
    const { game, userId } = job.data;

    const isPlayerInGame = await this.gamesService.isPlayerInGame(userId);
    if (isPlayerInGame) {
      const reason = 'You can only join one game';
      this.gamesGateway.sendFailedJoinEvent(userId, reason);
      return;
    }

    const roles = await this.gamesService.getAvailableRoles(game.id);
    if (roles.length === 0) {
      const reason = 'Game is full!';
      this.gamesGateway.sendFailedJoinEvent(userId, reason);
      return;
    }

    // Assign the user to the first available role by default
    const playerRole = roles[0];
    await this.gamesService.setUserInGame(userId, game.id, playerRole);
    await this.gamesGateway.sendSuccessfulJoinEvent(userId, {
      ...game,
      role: playerRole,
    });
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<JoinGameJobMessage>) {
    this.logger.verbose(
      `Processed a new join game to game ${job.data.game.id} (job: ${job.id})`,
    );
  }
}
