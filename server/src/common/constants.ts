// Models Names
export const GAMES_MODEL_NAME = 'games';
export const GAMES_MOVES_MODEL_NAME = 'games-moves';

// Queues Names
export const JOIN_GAMES_QUEUE_NAME = 'join-games';

export const REDIS_CLIENT_TOKEN = 'RedisClientToken';

export const NodeEnvironment = {
  DEVELOPMENT: 'development',
  STAGING: 'staging',
  PRODUCTION: 'production',
  TESTING: 'testing',
} as const;

export const WsEventPath = {
  JOIN: 'join',
  INFO_JOIN: 'info-join',
} as const;
