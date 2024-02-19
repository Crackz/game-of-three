import { BaseEntity } from 'src/common/entities/base.entity';
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { GameStatus } from './interfaces/games.interface';
import { GAMES_MODEL_NAME } from 'src/common/constants';

@Entity({ name: GAMES_MODEL_NAME })
export class GameEntity extends BaseEntity {
  @PrimaryGeneratedColumn()
  readonly id: number;

  @Column({
    type: 'enum',
    enum: GameStatus,
    default: GameStatus.ACTIVE,
  })
  status: GameStatus;

  @Column({ nullable: true })
  info?: string;
}
