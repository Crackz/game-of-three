import { ApiProperty } from '@nestjs/swagger';
import { WebSocketMessage } from 'src/common/interfaces/socket-message';

export enum GameRole {
  PLAYER_ONE = 'PLAYER_ONE',
  PLAYER_TWO = 'PLAYER_TWO',
}

export enum GameStatus {
  ACTIVE = 'ACTIVE',
  FINISHED = 'FINISHED',
}

export interface GamePlayerDetails {
  gameId: number;
  role: GameRole;
}

export class JoinGameWebSocketMessage extends WebSocketMessage {
  @ApiProperty({
    examples: [
      {
        game: {
          id: 11,
          isNew: true,
          role: GameRole.PLAYER_ONE,
        },
      },
      {
        info: 'Game is full!',
      },
    ],
  })
  data: {
    info?: string;
    game?: {
      id: number;
      isNew: boolean;
      role: GameRole;
    };
  };
}

export class InfoJoinGameWebSocketMessage extends WebSocketMessage {
  @ApiProperty({
    example: { info: 'Player x left the game' },
  })
  data: {
    info: string;
  };
}
