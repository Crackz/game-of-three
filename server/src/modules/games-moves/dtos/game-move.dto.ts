import { GameRole } from 'src/modules/games/interfaces/games.interface';
import { GameMoveAction } from '../interfaces/games-moves.interface';

export class GameMoveDto {
  id: string;
  number: number;
  action: GameMoveAction;
  role: GameRole;
  createdAt: Date;
}
