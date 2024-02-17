import { registerAs } from '@nestjs/config';
import * as dotenv from 'dotenv';
import { PostgresConnectionOptions } from 'typeorm/driver/postgres/PostgresConnectionOptions';
import { envFilePaths } from '.';
import { validateEnvironmentVariables } from '../common/env/validation';
import { DataSource } from 'typeorm';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';

const loadedDotEnv = dotenv.config({
  path: envFilePaths,
});
const loadedEnvironmentVars = validateEnvironmentVariables(loadedDotEnv.parsed);

const config: TypeOrmModuleOptions = {
  type: 'postgres' as const,
  host: `${loadedEnvironmentVars.DATABASE_HOST}`,
  port: +`${loadedEnvironmentVars.DATABASE_PORT}`,
  username: `${loadedEnvironmentVars.DATABASE_USERNAME}`,
  password: `${loadedEnvironmentVars.DATABASE_PASSWORD}`,
  database: `${loadedEnvironmentVars.DATABASE_NAME}`,
  migrations: ['dist/src/migrations/*{.ts,.js}'],
  autoLoadEntities: true,
};

export const typeormConfig = registerAs('typeorm', () => config);
export default new DataSource(config as PostgresConnectionOptions);
