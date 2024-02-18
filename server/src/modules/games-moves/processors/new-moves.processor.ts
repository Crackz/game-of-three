import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { NEW_MOVES_QUEUE_NAME } from 'src/common/constants';
import { GamesService } from 'src/modules/games/games.service';
import { GameRole } from 'src/modules/games/interfaces/games.interface';
import { GamesMovesService } from '../games-moves.service';
import { GamesMovesGateway } from '../gateways/games-moves.gateway';
import {
  GameMoveAction,
  LastGameMoveDetails,
} from '../interfaces/games-moves.interface';
import { NewMoveJobMessage } from '../interfaces/new-moves.interface';
import { GameMoveEntity } from '../game-move.entity';

@Processor(NEW_MOVES_QUEUE_NAME)
export class NewMovesProcessor extends WorkerHost {
  private logger = new Logger(NewMovesProcessor.name);

  constructor(
    private readonly gamesMovesGateway: GamesMovesGateway,
    private readonly gamesMovesService: GamesMovesService,
    private readonly gamesService: GamesService,
  ) {
    super();
  }

  validateFirstMove(role: GameRole, number?: number) {
    const isPlayerOne = role === GameRole.PLAYER_ONE;
    if (!isPlayerOne) {
      throw new Error('Only the player one can make the first move');
    }

    if (typeof number === 'undefined') {
      throw new Error('You should send a number for the first move');
    }
  }

  validateNextMove(
    role: GameRole,
    lastMove: LastGameMoveDetails,
    action?: GameMoveAction,
  ) {
    const isValidRoleMove = lastMove.role !== role;
    if (!isValidRoleMove) {
      throw new Error('Wait for the other player to make his move');
    }

    if (!action) {
      throw new Error(
        `You should make one of these actions ${Object.values(GameMoveAction)}`,
      );
    }
  }

  async handleNewMove({ userId, action, number }: NewMoveJobMessage) {
    const isPlayerInGame = await this.gamesService.isPlayerInGame(userId);
    if (!isPlayerInGame) {
      throw new Error("You can't make a move unless you're in a game");
    }

    const playerDetails = await this.gamesService.getPlayerDetails(userId);
    const lastMove = await this.gamesMovesService.getLastMoveDetails(
      playerDetails.gameId,
    );

    const isFirstMove = !lastMove;
    let newNumber: number;
    if (isFirstMove) {
      this.validateFirstMove(playerDetails.role, number);

      newNumber = number;
      action = GameMoveAction.NO_ACTION;
    } else {
      this.validateNextMove(playerDetails.role, lastMove, action);

      newNumber = this.gamesMovesService.checkNewMoveNumber(
        lastMove.number,
        action,
      );
    }

    return await this.gamesMovesService.createNewMove(playerDetails.gameId, {
      action,
      number: newNumber,
      role: playerDetails.role,
    });
  }

  async handleWinMove(move: GameMoveEntity) {
    await Promise.all([
      this.gamesMovesService.removeGameMoves(move.gameId),
      this.gamesService.markAsFinishedGame(move.gameId, move.role),
    ]);
    await this.gamesMovesGateway.sendWinMoveEvent(move);
  }

  async process(job: Job<NewMoveJobMessage>): Promise<any> {
    const { userId } = job.data;

    try {
      const newMove = await this.handleNewMove(job.data);
      this.gamesMovesGateway.sendSuccessfulNewMoveEvent(newMove);

      if (this.gamesMovesService.isWinMove(newMove)) {
        await this.handleWinMove(newMove);
      }
    } catch (err) {
      this.gamesMovesGateway.sendFailedNewMoveEvent(userId, err.message);
    }
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job<NewMoveJobMessage>) {
    const { userId, action } = job.data;
    this.logger.verbose(
      `Processed a new move by ${userId} with action ${action} (job: ${job.id})`,
    );
  }
}
