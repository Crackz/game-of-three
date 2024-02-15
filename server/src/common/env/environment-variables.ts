import { IsDefined, IsEnum, IsNumber, IsString } from 'class-validator';
import { NodeEnvironment } from '../constants';

export class EnvironmentVariables {
  // External Environment Variables

  @IsDefined()
  @IsEnum(NodeEnvironment)
  NODE_ENV: NodeEnvironment;

  // Database

  @IsDefined()
  @IsString()
  DATABASE_NAME: string;

  @IsDefined()
  @IsString()
  DATABASE_HOST: string;

  @IsDefined()
  @IsNumber()
  DATABASE_PORT: number;

  @IsDefined()
  @IsString()
  DATABASE_USERNAME: string;

  @IsDefined()
  @IsString()
  DATABASE_PASSWORD: string;

  @IsDefined()
  @IsString()
  REDIS_HOST: string;

  @IsDefined()
  @IsNumber()
  REDIS_PORT: number;

  // Server

  @IsDefined()
  @IsNumber()
  SERVER_PORT: number;

  @IsDefined()
  @IsNumber()
  SERVER_SOCKET_PING_TIMEOUT_IN_MS: number;

  @IsDefined()
  @IsNumber()
  SERVER_SOCKET_PING_INTERVAL_IN_MS: number;

  @IsDefined()
  @IsNumber()
  SERVER_SOCKET_TOLERANCE_IN_MS: number;

  @IsDefined()
  @IsNumber()
  GAME_MOVE_WAIT_TIME_IN_MS: number;
}
