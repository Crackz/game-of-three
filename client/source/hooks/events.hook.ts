import {useEffect, useState} from 'react';
import {Socket} from 'socket.io-client';
import {WsEventName} from '../common/constants.js';
import {GameEventMsg} from '../interfaces/events.interface.js';

export function useLastGameEvent(isConnected: boolean, socket: Socket) {
	const [lastEvent, setLastEvent] = useState<GameEventMsg | undefined>();

	useEffect(() => {
		if (!isConnected) {
			return;
		}

		socket.on(WsEventName.EVENTS, (gameEvent: GameEventMsg) => {
			setLastEvent(gameEvent);
		});

		return () => {
			socket.off(WsEventName.EVENTS);
		};
	}, [isConnected]);

	return lastEvent;
}
