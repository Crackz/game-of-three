export interface Game {
	id: number;
	role: GameRole;
	isNew: boolean;
}

export enum GameRole {
	PLAYER_ONE = 'PLAYER_ONE',
	PLAYER_TWO = 'PLAYER_TWO',
}

export interface GameStatusEventMsg {
	data: {
		info: string;
	};
}
