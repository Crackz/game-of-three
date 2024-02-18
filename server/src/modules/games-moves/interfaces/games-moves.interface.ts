import { ApiProperty } from '@nestjs/swagger';
import { WebSocketMessage } from 'src/common/interfaces/socket-message';
import { GameRole } from 'src/modules/games/interfaces/games.interface';

export enum GameMoveAction {
  ADDED_ONE = 'ADDED_ONE',
  NO_ACTION = 'NO_ACTION',
  SUBTRACTED_ONE = 'SUBTRACTED_ONE',
}

export class NewMoveWebSocketMessage extends WebSocketMessage {
  @ApiProperty({
    example: {},
  })
  data: {
    info?: string;
    move?: {
      number: number;
      role: GameRole;
      action: GameMoveAction;
    };
  };
}

export interface LastGameMoveDetails {
  role: GameRole;
  number: number;
  action: GameMoveAction;
}
