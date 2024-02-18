import { UseFilters, UsePipes } from '@nestjs/common';
import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
} from '@nestjs/websockets';
import { AsyncApiPub } from 'nestjs-asyncapi';
import { Socket } from 'socket.io';
import { WsEventPath } from 'src/common/constants';
import { WsExceptionsFilter } from 'src/common/filters/ws-exceptions.filter';
import { BaseGateway } from 'src/common/gateways/base.gateway';
import { DefaultValidationPipe } from 'src/common/pipes/default-validation.pipe';
import { MakeNewMoveDto } from '../dtos/make-new-move.dto';
import { GameMoveEntity } from '../game-move.entity';
import { GamesMovesService } from '../games-moves.service';
import { NewMoveWebSocketMessage } from '../interfaces/games-moves.interface';
import { GamesGateway } from 'src/modules/games/gateways/games.gateway';

@WebSocketGateway({ namespace: 'games', cors: true })
export class GamesMovesGateway extends BaseGateway {
  constructor(
    private readonly gamesMovesService: GamesMovesService,
    private readonly gamesGateway: GamesGateway,
  ) {
    super(GamesMovesGateway.name);
  }

  @UseFilters(WsExceptionsFilter)
  @UsePipes(DefaultValidationPipe)
  @SubscribeMessage(WsEventPath.NEW_MOVE)
  @AsyncApiPub({
    channel: WsEventPath.NEW_MOVE,
    message: {
      payload: NewMoveWebSocketMessage,
    },
  })
  async handleNewMoveEvent(
    @ConnectedSocket() socket: Socket,
    @MessageBody() makeNewMoveDto: MakeNewMoveDto,
  ): Promise<boolean> {
    await this.gamesMovesService.tryToMakeNewMove(makeNewMoveDto, socket.id);
    return true;
  }

  sendFailedNewMoveEvent(socketId: string, reason: string) {
    const socket = this.getSocket(socketId);
    if (!socket) {
      return;
    }

    const newMoveMessage: NewMoveWebSocketMessage = {
      success: false,
      data: {
        info: reason,
      },
    };
    socket.emit(WsEventPath.NEW_MOVE, newMoveMessage);
  }

  sendSuccessfulNewMoveEvent(newMove: GameMoveEntity) {
    const newMoveMessage: NewMoveWebSocketMessage = {
      success: true,
      data: {
        move: {
          action: newMove.action,
          number: newMove.number,
          role: newMove.role,
        },
      },
    };

    const roomId = this.gamesGateway.getRoomId(newMove.gameId);
    this.server.to(roomId).emit(WsEventPath.NEW_MOVE, newMoveMessage);
  }

  async sendWinMoveEvent(move: GameMoveEntity): Promise<void> {
    await this.gamesGateway.sendFinishedEvent(move.gameId);
  }
}
