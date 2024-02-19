import {Box, Text} from 'ink';
import React, {useContext} from 'react';
import {Socket} from 'socket.io-client';
import {SocketContext} from '../contexts/socket.context.js';
import {useLastGameEvent} from '../hooks/events.hook.js';

export const Events = ({isConnected}: {isConnected: boolean}) => {
	const socket = useContext(SocketContext) as Socket;
	const lastEvent = useLastGameEvent(isConnected, socket);
	if (!lastEvent) return;
	return (
		<Box>
			<Text color="yellowBright" dimColor>
				{lastEvent.data.info}
			</Text>
		</Box>
	);
};
