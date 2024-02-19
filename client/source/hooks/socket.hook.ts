import {useEffect, useState} from 'react';
import * as io from 'socket.io-client';
import {WS_HOST} from '../common/constants.js';

const socket = io.connect(WS_HOST, {
	autoConnect: false,
});

export function useSocket(): [boolean, io.Socket] {
	const [isConnected, setIsConnected] = useState<boolean>(false);

	useEffect(() => {
		socket.on('connect', () => setIsConnected(true));
		socket.on('disconnect', () => {
			setIsConnected(false);
		});

		socket.connect();
		return () => {
			socket.disconnect();
		};
	}, []);

	return [isConnected, socket];
}
