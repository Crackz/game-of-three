import {
  DeepPartial,
  FindManyOptions,
  FindOneOptions,
  Repository,
  UpdateResult,
} from 'typeorm';
import { BaseEntity } from '../entities/base.entity';
import { DeepWritable } from '../types/writable';
import { RequiredOnly } from '../types/required-only';
import { QueryDeepPartialEntity } from 'typeorm/query-builder/QueryPartialEntity';

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

  async findByIdAndUpdate(
    id: string | number,
    updatedData: QueryDeepPartialEntity<T>,
  ): Promise<UpdateResult> {
    return await this._repo.update(id, updatedData);
  }

  async create(data: DeepWritable<T>): Promise<T> {
    return await this._repo.save(data as DeepPartial<T>);
  }
}
