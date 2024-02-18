// Models Names
export const GAMES_MODEL_NAME = 'games';
export const GAMES_MOVES_MODEL_NAME = 'games-moves';

// Queues Names
export const JOIN_GAMES_QUEUE_NAME = 'join-games';
export const NEW_MOVES_QUEUE_NAME = 'new-moves';

// Tokens
export const REDIS_CLIENT_TOKEN = 'RedisClientToken';

export const NodeEnvironment = {
  DEVELOPMENT: 'development',
  STAGING: 'staging',
  PRODUCTION: 'production',
  TESTING: 'testing',
} as const;

export const WsEventPath = {
  ERROR: 'error',
  JOIN: 'join',
  EVENTS: 'events',
  NEW_MOVE: 'new-move',
  GAME_STATUS: 'game-status',
} as const;

export const DIVIDE_BY = 3;
