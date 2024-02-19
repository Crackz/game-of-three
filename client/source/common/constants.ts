export const API_HOST = 'http://localhost:3000/v1';
export const WS_HOST = 'ws://localhost:3000/games';

export const WsEventName = {
	JOIN: 'join',
	NEW_MOVE: 'new-move',
	EVENTS: 'events',
	ERROR: 'error',
	GAME_STATUS: 'game-status',
} as const;
