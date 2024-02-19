import { OnApplicationShutdown } from '@nestjs/common';
import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { AsyncApiPub } from 'nestjs-asyncapi';
import { Socket } from 'socket.io';
import { WsEventPath } from 'src/common/constants';
import { BaseGateway } from 'src/common/gateways/base.gateway';
import { GamesService } from '../games.service';
import {
  GameEventWebSocketMessage,
  GameRole,
  GameStatusWebSocketMessage,
  JoinGameWebSocketMessage,
} from '../interfaces/games.interface';
import { BotsService } from 'src/modules/bots/bots.service';

@WebSocketGateway({ namespace: 'games', cors: true })
export class GamesGateway
  extends BaseGateway
  implements
    OnGatewayConnection<Socket>,
    OnGatewayDisconnect<Socket>,
    OnApplicationShutdown
{
  constructor(
    private readonly gamesService: GamesService,
    private readonly botsService: BotsService,
  ) {
    super(GamesGateway.name);
  }

  getRoomId(gameId: number): string {
    return `games/${gameId}`;
  }

  private getGameEventMessage(
    socketId: string,
    role: GameRole,
    eventType: 'JOIN' | 'LEAVE',
  ): GameEventWebSocketMessage {
    const playerNumber = this.gamesService.mapRoleToNumber(role);
    switch (eventType) {
      case 'JOIN':
        return {
          data: {
            info: `Player ${playerNumber} with id ${socketId} joined the game`,
          },
        };
      case 'LEAVE':
        return {
          data: {
            info: `Player ${playerNumber} with id ${socketId} left the game`,
          },
        };
      default:
        throw new Error('Unhandled game event type: ' + eventType);
    }
  }

  @SubscribeMessage(WsEventPath.JOIN)
  @AsyncApiPub({
    channel: WsEventPath.JOIN,
    message: {
      payload: JoinGameWebSocketMessage,
    },
  })
  async handleJoinEvent(@ConnectedSocket() socket: Socket): Promise<boolean> {
    const { game, isNewGame } = await this.gamesService.getActiveGame();
    await this.gamesService.tryToJoinGame(socket.id, {
      id: game.id,
      isNew: isNewGame,
    });

    return true;
  }

  async sendFailedJoinEvent(socketId: string, reason: string) {
    const socket = this.getSocket(socketId);
    if (!socket) {
      return;
    }
    const infoMessage: JoinGameWebSocketMessage = {
      success: false,
      data: {
        info: reason,
      },
    };
    socket.emit(WsEventPath.JOIN, infoMessage);
  }

  async sendSuccessfulJoinEvent(
    socketId: string,
    game: { id: number; role: GameRole; isNew: boolean },
  ) {
    const socket = this.getSocket(socketId);
    if (!socket) {
      return;
    }

    const roomId = this.getRoomId(game.id);
    socket.join(roomId);

    if (!game.isNew) {
      const infoMessage = this.getGameEventMessage(
        socket.id,
        game.role,
        'JOIN',
      );
      this.sendGameEventEvent(game.id, infoMessage);
    }

    const joinedMessage: JoinGameWebSocketMessage = {
      success: true,
      data: {
        game,
      },
    };
    socket.emit(WsEventPath.JOIN, joinedMessage);

    await this.botsService.tryToMakeBotNewMove(game.id);
  }

  @AsyncApiPub({
    channel: WsEventPath.EVENTS,
    message: { payload: GameEventWebSocketMessage },
  })
  sendGameEventEvent(
    gameId: number,
    infoMessage: GameEventWebSocketMessage,
  ): void {
    const roomId = this.getRoomId(gameId);
    this.server.to(roomId).emit(WsEventPath.EVENTS, infoMessage);
  }

  @AsyncApiPub({
    channel: WsEventPath.GAME_STATUS,
    message: {
      payload: GameStatusWebSocketMessage,
    },
  })
  async sendFinishedEvent(gameId: number) {
    const game = await this.gamesService.getGame(gameId);

    const gameStatusMsg: GameStatusWebSocketMessage = {
      data: { info: game.info },
    };

    const roomId = this.getRoomId(gameId);
    this.server.to(roomId).emit(WsEventPath.GAME_STATUS, gameStatusMsg);
    await this.server.in(roomId).socketsLeave(roomId);
  }

  handleConnection(socket: Socket) {
    this.logger.verbose(`Socket Connected: ${socket.id}`);
  }

  async handleDisconnect(socket: Socket) {
    const leftGame = await this.gamesService.removeUserFromGame(socket.id);
    if (leftGame) {
      const infoMessage = this.getGameEventMessage(
        socket.id,
        leftGame.role,
        'LEAVE',
      );
      this.sendGameEventEvent(leftGame.id, infoMessage);

      await this.botsService.tryToMakeBotNewMove(leftGame.id);
    }

    this.logger.verbose(`Socket Disconnected: ${socket.id}`);
  }

  async onApplicationShutdown() {
    this.logger.verbose('Disconnecting Connected Sockets');
    const sockets = await this.server.fetchSockets();
    await Promise.all(
      sockets.map(async (socket) => await socket.disconnect(true)),
    );
  }
}
