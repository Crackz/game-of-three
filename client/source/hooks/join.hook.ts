import {useEffect, useState} from 'react';
import {Socket} from 'socket.io-client';
import {Game} from '../interfaces/game.interface.js';
import {WsEventName} from '../common/constants.js';
import {JoinEventMsg} from '../interfaces/join.interface.js';

export function useJoinGame(isConnected: boolean, socket: Socket) {
	const [game, setGame] = useState<Game | null>(null);

	useEffect(() => {
		if (!isConnected) {
			return;
		}

		socket.on(WsEventName.JOIN, (msg: JoinEventMsg) => {
			if (msg.success) {
				setGame(msg.data.game || null);
			} else {
				console.log('UNHANDLED ERROR JOIN');
			}
		});
		socket.emit(WsEventName.JOIN);

		return () => {
			socket.off(WsEventName.JOIN);
		};
	}, [isConnected]);

	return game;
}
