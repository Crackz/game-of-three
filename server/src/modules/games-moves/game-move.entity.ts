import { GAMES_MOVES_MODEL_NAME } from 'src/common/constants';
import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { GameEntity } from '../games/game.entity';
import { GameMoveAction } from './interfaces/games-moves.interface';
import { GameRole } from '../games/interfaces/games.interface';

@Entity({ name: GAMES_MOVES_MODEL_NAME })
export class GameMoveEntity extends BaseEntity {
  @PrimaryGeneratedColumn('uuid')
  readonly id: string;

  @Column()
  number: number;

  @Column({
    type: 'enum',
    enum: GameMoveAction,
  })
  action: GameMoveAction;

  @Column({
    type: 'enum',
    enum: GameRole,
  })
  role: GameRole;

  @Column()
  gameId: number;

  @ManyToOne(() => GameEntity, (game) => game.id, { onDelete: 'CASCADE' })
  readonly game: GameEntity;
}
