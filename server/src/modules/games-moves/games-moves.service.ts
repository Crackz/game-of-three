import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { Queue } from 'bullmq';
import { DIVIDE_BY, NEW_MOVES_QUEUE_NAME } from 'src/common/constants';
import { InMemoryRepository } from '../in-memory/in-memory.repository';
import { MakeNewMoveDto } from './dtos/make-new-move.dto';
import { GameMoveEntity } from './game-move.entity';
import { GamesMovesRepository } from './games-moves.repository';
import {
  GameMoveAction,
  LastGameMoveDetails,
} from './interfaces/games-moves.interface';
import { NewMoveJobMessage } from './interfaces/new-moves.interface';
import { GameMoveDto } from './dtos/game-move.dto';
import { GamesService } from '../games/games.service';

@Injectable()
export class GamesMovesService implements OnApplicationBootstrap {
  private readonly gameMovePrefix = 'game-move';

  constructor(
    private readonly gamesMovesRepo: GamesMovesRepository,
    private readonly gamesService: GamesService,
    private readonly inMemoryRepo: InMemoryRepository,
    @InjectQueue(NEW_MOVES_QUEUE_NAME) private newMovesQueue: Queue,
  ) {}

  async onApplicationBootstrap() {
    await this.removeAllGamesMoves();
  }
  /**
   * Clean up any stale games moves
   * This could happen when the server crashes
   * Deleting by a pattern isn't the best solution to this problem as It could cause
   * performance issues (if we going to have hundreds of thousands of keys)
   * It's done this way to keep things simple
   */
  async removeAllGamesMoves() {
    await this.inMemoryRepo.deleteByPattern(this.gameMovePrefix);
  }

  async tryToMakeNewMove(makeNewMoveDto: MakeNewMoveDto, userId: string) {
    const newMoveJobMessage: NewMoveJobMessage = {
      userId,
      action: makeNewMoveDto.action,
      number: makeNewMoveDto.number,
    };
    await this.newMovesQueue.add('*', newMoveJobMessage);
  }

  private getLastMoveDetailsKey(gameId: number) {
    return `${this.gameMovePrefix}:last:${gameId}`;
  }

  async createNewMove(
    gameId: number,
    lastMoveDetails: LastGameMoveDetails,
  ): Promise<GameMoveEntity> {
    const lastMoveKey = this.getLastMoveDetailsKey(gameId);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [_, newMove] = await Promise.all([
      this.inMemoryRepo.set(lastMoveKey, JSON.stringify(lastMoveDetails)),
      this.gamesMovesRepo.create({
        gameId,
        ...lastMoveDetails,
      }),
    ]);
    return newMove;
  }

  async getLastMoveDetails(
    gameId: number,
  ): Promise<LastGameMoveDetails | null> {
    const lastMoveKey = this.getLastMoveDetailsKey(gameId);
    const lastMoveDetailsAsStr = await this.inMemoryRepo.get(lastMoveKey);
    if (lastMoveDetailsAsStr) {
      return JSON.parse(lastMoveDetailsAsStr) as LastGameMoveDetails;
    }

    const lastMove = await this.gamesMovesRepo.findOneLastMove(gameId);
    if (lastMove) {
      return {
        number: lastMove.number,
        role: lastMove.role,
        action: lastMove.action,
        isBot: lastMove.isBot,
      };
    }

    return null;
  }

  checkNewMoveNumber(currNumber: number, action: GameMoveAction): number {
    let newNumber: number;
    switch (action) {
      case GameMoveAction.NO_ACTION: {
        newNumber = currNumber;
        break;
      }
      case GameMoveAction.ADDED_ONE: {
        newNumber = currNumber + 1;
        break;
      }
      case GameMoveAction.SUBTRACTED_ONE: {
        newNumber = currNumber - 1;
        break;
      }
      default:
        throw new Error('Unhandled Game Move Action: ' + action);
    }

    const isDividable = newNumber % DIVIDE_BY === 0;
    if (!isDividable) {
      throw new Error(
        `Dividing ${newNumber} by ${DIVIDE_BY} won't result in a whole number`,
      );
    }

    return newNumber / DIVIDE_BY;
  }

  getValidNewMoveAction(currNumber: number): {
    action: GameMoveAction;
    newNumber: number;
  } {
    const newNumberWithoutAction = currNumber;
    const newNumberWithAddedOne = currNumber + 1;
    const newNumberWithSubtractedOne = currNumber - 1;

    if (newNumberWithoutAction % DIVIDE_BY === 0) {
      return {
        action: GameMoveAction.NO_ACTION,
        newNumber: newNumberWithoutAction / DIVIDE_BY,
      };
    }

    if (newNumberWithAddedOne % DIVIDE_BY === 0) {
      return {
        action: GameMoveAction.ADDED_ONE,
        newNumber: newNumberWithAddedOne / DIVIDE_BY,
      };
    }

    if (newNumberWithSubtractedOne % DIVIDE_BY === 0) {
      return {
        action: GameMoveAction.SUBTRACTED_ONE,
        newNumber: newNumberWithSubtractedOne / DIVIDE_BY,
      };
    }

    throw new Error("Couldn't find a valid move for the bot");
  }

  isWinMove(move: GameMoveEntity) {
    return move.number === 1;
  }

  async removeGameMoves(gameId: number) {
    const lastMoveDetailsKey = this.getLastMoveDetailsKey(gameId);
    await this.inMemoryRepo.delete(lastMoveDetailsKey);
  }

  async viewMany(gameId: number): Promise<GameMoveDto[]> {
    const gameMoves = await this.gamesMovesRepo.find(
      { gameId },
      { order: { createdAt: 'ASC' } },
    );
    return gameMoves.map(
      (gameMove): GameMoveDto => ({
        id: gameMove.id,
        action: gameMove.action,
        number: gameMove.number,
        role: gameMove.role,
        isBot: gameMove.isBot,
        createdAt: gameMove.createdAt,
      }),
    );
  }

  async handleWinMove(move: GameMoveEntity) {
    await Promise.all([
      this.removeGameMoves(move.gameId),
      this.gamesService.markAsFinishedGame(move.gameId, move.role),
    ]);
  }
}
