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

export interface JoinGameWebSocketMessage extends WebSocketMessage {
  data: {
    info?: string;
    game?: {
      id: number;
      isNew: boolean;
      role: GameRole;
    };
  };
}

export interface InfoJoinGameWebSocketMessage extends WebSocketMessage {
  data: {
    info: string;
  };
}
