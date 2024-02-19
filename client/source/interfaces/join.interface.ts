import {GameRole} from './game.interface.js';

export interface JoinEventMsg {
	success: true;
	data: {
		info?: string;
		game?: {
			id: number;
			isNew: boolean;
			role: GameRole;
		};
	};
}
