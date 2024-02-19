import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { BOT_MOVES_MANAGER_QUEUE_NAME } from 'src/common/constants';
import { GamesMovesService } from 'src/modules/games-moves/games-moves.service';
import { GamesMovesGateway } from 'src/modules/games-moves/gateways/games-moves.gateway';
import { GamesService } from 'src/modules/games/games.service';
import { BotNewMoveJobMessage } from '../interfaces/bot-moves-manager.interface';

@Processor(BOT_MOVES_MANAGER_QUEUE_NAME)
export class BotMovesManagerProcessor extends WorkerHost {
  private logger = new Logger(BotMovesManagerProcessor.name);

  constructor(
    private readonly gamesService: GamesService,
    private readonly gamesMovesService: GamesMovesService,
    private readonly gamesMovesGateway: GamesMovesGateway,
  ) {
    super();
  }
  async process(job: Job<BotNewMoveJobMessage>): Promise<any> {
    const { gameId } = job.data;

    const isGameFull = await this.gamesService.isGameFull(gameId);
    if (isGameFull) {
      // Bot move is ignored when the game has all players
      return;
    }

    const isGameEmpty = await this.gamesService.isGameEmpty(gameId);
    if (isGameEmpty) {
      // Bot move is ignored when the game don't have any player
      return;
    }

    const availableRoles = await this.gamesService.getAvailableRoles(gameId);
    const lastMoveDetails =
      await this.gamesMovesService.getLastMoveDetails(gameId);

    const botRole = availableRoles[0];
    const shouldMakeMove = botRole !== lastMoveDetails.role;

    if (!shouldMakeMove) {
      // Bot move is ignored when the other player is still making his move
      return;
    }

    const { action, newNumber } = this.gamesMovesService.getValidNewMoveAction(
      lastMoveDetails.number,
    );

    const newMove = await this.gamesMovesService.createNewMove(gameId, {
      action,
      isBot: true,
      number: newNumber,
      role: botRole,
    });

    this.gamesMovesGateway.sendSuccessfulNewMoveEvent(newMove);

    if (this.gamesMovesService.isWinMove(newMove)) {
      await this.gamesMovesService.handleWinMove(newMove);
      await this.gamesMovesGateway.sendWinMoveEvent(newMove);
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<BotNewMoveJobMessage>) {
    const { gameId } = job.data;
    this.logger.verbose(
      `Processed a new bot move for game ${gameId} (job: ${job.id})`,
    );
  }
}
