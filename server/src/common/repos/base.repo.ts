import {
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  Repository,
} from 'typeorm';
import { BaseEntity } from '../entities/base.entity';
import { DeepWritable } from '../types/writable';

export abstract class BaseRepo<T extends BaseEntity> {
  constructor(readonly _repo: Repository<T>) {}

  async find(
    query?: FindManyOptions<T>['where'],
    opts = {} as { order?: FindManyOptions<T>['order'] },
  ): Promise<T[]> {
    return await this._repo.find({ where: query, ...opts });
  }

  async findOne(
    query?: FindOneOptions<T>['where'],
    opts = {} as { order?: FindManyOptions<T>['order'] },
  ): Promise<T | null> {
    return await this._repo.findOne({ where: query, ...opts });
  }

  async create(data: DeepPartial<DeepWritable<T>>) {
    return await this._repo.save(data as DeepPartial<T>);
  }
}
