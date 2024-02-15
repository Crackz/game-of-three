import { InjectQueue } from '@nestjs/bullmq';
import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import { Queue } from 'bullmq';
import { JOIN_GAMES_QUEUE_NAME } from 'src/common/constants';
import { InMemoryRepository } from '../in-memory/in-memory.repository';
import { GameEntity } from './game.entity';
import { GamesRepository } from './games.repository';
import {
  GamePlayerDetails,
  GameRole,
  GameStatus,
} from './interfaces/games.interface';
import { JoinGameJobMessage } from './interfaces/join-games.interface';

@Injectable()
export class GamesService implements OnApplicationBootstrap {
  private readonly gamePrefix = 'game';
  private readonly gamePlayerPrefix = 'game-player';

  constructor(
    private readonly gameRepo: GamesRepository,
    @InjectQueue(JOIN_GAMES_QUEUE_NAME) private joinGamesQueue: Queue,
    private readonly inMemoryRepo: InMemoryRepository,
  ) {}

  async onApplicationBootstrap() {
    // Clean up any stale games, game players states
    // This could happen when the server crashes
    // Deleting by a pattern isn't the best solution to this problem as It could cause
    // performance issues (if we going to have hundreds of thousands of keys)
    // It's done this way to keep things simple
    await Promise.all([
      this.inMemoryRepo.deleteByPattern(this.gamePrefix),
      this.inMemoryRepo.deleteByPattern(this.gamePlayerPrefix),
    ]);
  }

  getPlayerRoleKey(gameId: number, playerRole: GameRole): string {
    return `${this.gamePrefix}:${gameId}:${playerRole}`;
  }

  getPlayerKey(userId: string): string {
    return `${this.gamePlayerPrefix}:${userId}`;
  }

  async getActiveGame(): Promise<{
    game: GameEntity;
    isNewGame: boolean;
  }> {
    const activeGames = await this.gameRepo.find(
      {
        status: GameStatus.ACTIVE,
      },
      { order: { createdAt: 'ASC' } },
    );

    for (const activeGame of activeGames) {
      const isGameFull = await this.isGameFull(activeGame.id);
      if (!isGameFull) {
        return { game: activeGame, isNewGame: false };
      }
    }

    const newGame = await this.gameRepo.create({ status: GameStatus.ACTIVE });
    return { game: newGame, isNewGame: true };
  }

  async tryToJoinGame(
    userId: string,
    game: { id: number; isNew: boolean },
  ): Promise<void> {
    const joinGameJobMessage: JoinGameJobMessage = { game, userId };
    await this.joinGamesQueue.add('*', joinGameJobMessage);
  }

  async isRoleInGame(gameId: number, role: GameRole): Promise<boolean> {
    const playerRoleKey = this.getPlayerRoleKey(gameId, role);
    const isRoleInGame = await this.inMemoryRepo.exists(playerRoleKey);
    return isRoleInGame;
  }

  async isPlayerInGame(userId: string): Promise<boolean> {
    const playerKey = this.getPlayerKey(userId);
    const isPlayerInGame = await this.inMemoryRepo.exists(playerKey);
    return isPlayerInGame;
  }

  async isGameFull(gameId: number): Promise<boolean> {
    const [playerOneIsInGame, playerTwoIsInGame] = await Promise.all([
      this.isRoleInGame(gameId, GameRole.PLAYER_ONE),
      this.isRoleInGame(gameId, GameRole.PLAYER_TWO),
    ]);

    return playerOneIsInGame && playerTwoIsInGame;
  }

  async getAvailableRoles(gameId: number): Promise<GameRole[]> {
    const [playerOneIsInGame, playerTwoIsInGame] = await Promise.all([
      this.isRoleInGame(gameId, GameRole.PLAYER_ONE),
      this.isRoleInGame(gameId, GameRole.PLAYER_TWO),
    ]);

    const roles: GameRole[] = [];
    if (!playerOneIsInGame) {
      roles.push(GameRole.PLAYER_ONE);
    }

    if (!playerTwoIsInGame) {
      roles.push(GameRole.PLAYER_TWO);
    }

    return roles;
  }

  async setUserInGame(userId: string, gameId: number, role: GameRole) {
    const playerRoleKey = this.getPlayerRoleKey(gameId, role);
    await this.inMemoryRepo.set(playerRoleKey, userId);

    const playerKey = this.getPlayerKey(userId);
    const playerDetails: GamePlayerDetails = { gameId, role };
    await this.inMemoryRepo.set(playerKey, JSON.stringify(playerDetails));
  }

  async removeUserFromGame(userId: string): Promise<{
    id: number;
    role: GameRole;
  } | null> {
    const playerKey = this.getPlayerKey(userId);
    const playerDetailsAsStr = await this.inMemoryRepo.get(playerKey);
    if (!playerDetailsAsStr) {
      return null;
    }

    const playerDetails: GamePlayerDetails = JSON.parse(playerDetailsAsStr);

    const playerRoleKey = this.getPlayerRoleKey(
      playerDetails.gameId,
      playerDetails.role,
    );

    await this.inMemoryRepo.delete(playerRoleKey);
    await this.inMemoryRepo.delete(playerKey);

    return { id: playerDetails.gameId, role: playerDetails.role };
  }

  mapRoleToRoleName(role: GameRole): string {
    switch (role) {
      case GameRole.PLAYER_ONE:
        return 'player 1';
      case GameRole.PLAYER_TWO:
        return 'player 2';
      default:
        throw new Error(`Unhandled role ${role} to role name `);
    }
  }
}
