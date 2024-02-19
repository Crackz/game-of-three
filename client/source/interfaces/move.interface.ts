import {GameRole} from './game.interface.js';

export enum GameMoveAction {
	NO_ACTION = 'NO_ACTION',
	ADDED_ONE = 'ADDED_ONE',
	SUBTRACTED_ONE = 'SUBTRACTED_ONE',
}

export interface GameMove {
	id: string;
	action: GameMoveAction;
	number: number;
	role: GameRole;
	isBot: boolean;
	createdAt: string;
}

export interface NewMoveEventMsg {
	success: boolean;
	data: {
		info?: string;
		move?: {
			action: GameMoveAction;
			number: number;
			role: GameRole;
			isBot: boolean;
		};
	};
}

export interface NewMoveMsg {
	action?: GameMoveAction;
	number?: string;
}

export interface ErrorMsg {
	errors: object[];
}
