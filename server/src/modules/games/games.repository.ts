import { Injectable } from '@nestjs/common';
import { BaseRepo } from 'src/common/repos/base.repo';
import { GameEntity } from './game.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class GamesRepository extends BaseRepo<GameEntity> {
  constructor(
    @InjectRepository(GameEntity) private repo: Repository<GameEntity>,
  ) {
    super(repo);
  }
}
