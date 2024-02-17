import { Logger, OnApplicationShutdown } from '@nestjs/common';
import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { AsyncApiPub } from 'nestjs-asyncapi';
import { Server, Socket } from 'socket.io';
import { WsEventPath } from 'src/common/constants';
import { GamesService } from '../games.service';
import {
  GameRole,
  InfoJoinGameWebSocketMessage,
  JoinGameWebSocketMessage,
} from '../interfaces/games.interface';

@WebSocketGateway({ namespace: 'games', cors: true })
export class JoinGamesGateway
  implements
    OnGatewayConnection<Socket>,
    OnGatewayDisconnect<Socket>,
    OnApplicationShutdown
{
  @WebSocketServer()
  private readonly server: Server;
  private readonly logger = new Logger(JoinGamesGateway.name);

  constructor(private readonly gamesService: GamesService) {}

  private getRoomId(gameId: number): string {
    return `games/${gameId}`;
  }

  private getSocket(socketId: string): Socket {
    // There is a type issue it could be from socket.io or nest socket io package
    return (this.server.sockets as unknown as Map<string, any>).get(socketId);
  }

  private getInfoJoinMessage(
    socketId: string,
    role: GameRole,
    msgType: 'JOIN' | 'LEAVE',
  ): InfoJoinGameWebSocketMessage {
    const playerNumber = this.gamesService.mapRoleToNumber(role);
    switch (msgType) {
      case 'JOIN':
        return {
          success: true,
          data: {
            info: `Player ${playerNumber} with id ${socketId} joined the game`,
          },
        };
      case 'LEAVE':
        return {
          success: true,
          data: {
            info: `Player ${playerNumber} with id ${socketId} left the game`,
          },
        };
      default:
        throw new Error('Unhandled info join type: ' + msgType);
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
    socket.rooms.add(roomId);
    socket.join(roomId);

    if (!game.isNew) {
      const infoMessage = this.getInfoJoinMessage(socket.id, game.role, 'JOIN');
      this.sendInfoJoinEvent(game.id, infoMessage);
    }

    const joinedMessage: JoinGameWebSocketMessage = {
      success: true,
      data: {
        game,
      },
    };
    socket.emit(WsEventPath.JOIN, joinedMessage);
  }

  @AsyncApiPub({
    channel: WsEventPath.INFO_JOIN,
    message: { payload: InfoJoinGameWebSocketMessage },
  })
  sendInfoJoinEvent(
    gameId: number,
    infoMessage: InfoJoinGameWebSocketMessage,
  ): void {
    const roomId = this.getRoomId(gameId);
    this.server.to(roomId).emit(WsEventPath.INFO_JOIN, infoMessage);
  }

  handleConnection(socket: Socket) {
    this.logger.verbose(`Socket Connected: ${socket.id}`);
  }

  async handleDisconnect(socket: Socket) {
    const leftGame = await this.gamesService.removeUserFromGame(socket.id);
    if (leftGame) {
      const infoMessage = this.getInfoJoinMessage(
        socket.id,
        leftGame.role,
        'LEAVE',
      );
      this.sendInfoJoinEvent(leftGame.id, infoMessage);
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
