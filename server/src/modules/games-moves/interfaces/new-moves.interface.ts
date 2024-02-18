import { GameMoveAction } from './games-moves.interface';

export interface NewMoveJobMessage {
  userId: string;
  number?: number;
  action?: GameMoveAction;
}
