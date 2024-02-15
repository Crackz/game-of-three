import { Logger, OnApplicationShutdown } from '@nestjs/common';
import {
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { GamesService } from '../games.service';
import {
  GameRole,
  InfoJoinGameWebSocketMessage,
  JoinGameWebSocketMessage,
} from '../interfaces/games.interface';

@WebSocketGateway({ namespace: 'games' })
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

  private getJoinEventName() {
    return 'join';
  }

  private getInfoJoinEventName() {
    return 'info-join';
  }

  private getSocket(socketId: string): Socket {
    // There is a type issue it could be from socket.io or nest socket io package
    return (this.server.sockets as unknown as Map<string, any>).get(socketId);
  }

  private getInfoJoinMessage(
    socketId: string,
    role: GameRole,
    type: 'JOIN' | 'LEAVE',
  ): InfoJoinGameWebSocketMessage {
    const roleName = this.gamesService.mapRoleToRoleName(role);
    switch (type) {
      case 'JOIN':
        return {
          success: true,
          data: {
            info: `Player ${socketId} with role ${roleName} joined the game`,
          },
        };
      case 'LEAVE':
        return {
          success: true,
          data: {
            info: `Player ${socketId} with role ${roleName} left the game`,
          },
        };
      default:
        throw new Error('Unhandled info join type: ' + type);
    }
  }

  @SubscribeMessage('join')
  async handleJoinEvent(@ConnectedSocket() socket: Socket): Promise<void> {
    const { game, isNewGame } = await this.gamesService.getActiveGame();
    await this.gamesService.tryToJoinGame(socket.id, {
      id: game.id,
      isNew: isNewGame,
    });
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
    socket.emit(this.getJoinEventName(), infoMessage);
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
      this.sendInfoJoinEvent(socket, game.id, infoMessage);
    }

    const joinedMessage: JoinGameWebSocketMessage = {
      success: true,
      data: {
        game,
      },
    };
    socket.emit(this.getJoinEventName(), joinedMessage);
  }

  sendInfoJoinEvent(
    socket: Socket,
    gameId: number,
    infoMessage: InfoJoinGameWebSocketMessage,
  ): void {
    const roomId = this.getRoomId(gameId);
    socket.to(roomId).emit(this.getInfoJoinEventName(), infoMessage);
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
      this.sendInfoJoinEvent(socket, leftGame.id, infoMessage);
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
