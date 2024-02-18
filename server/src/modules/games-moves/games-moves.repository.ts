import { Injectable } from '@nestjs/common';
import { BaseRepo } from 'src/common/repos/base.repo';
import { GameMoveEntity } from './game-move.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class GamesMovesRepository extends BaseRepo<GameMoveEntity> {
  constructor(
    @InjectRepository(GameMoveEntity) private repo: Repository<GameMoveEntity>,
  ) {
    super(repo);
  }

  async findOneLastMove(gameId: number): Promise<GameMoveEntity | null> {
    return await this.findOne({ gameId }, { order: { createdAt: 'DESC' } });
  }
}
