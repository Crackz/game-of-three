import {Box, Text} from 'ink';
import React, {useContext, useEffect, useState} from 'react';
import {Socket} from 'socket.io-client';
import {GameInfo} from './components/game-info.js';
import {Moves} from './components/moves.js';
import {SocketContext} from './contexts/socket.context.js';
import {useJoinGame} from './hooks/join.hook.js';
import {Events} from './components/events.js';
import {WsEventName} from './common/constants.js';
import {GameStatusEventMsg} from './interfaces/game.interface.js';

export const Game = ({isConnected}: {isConnected: boolean}) => {
	const socket = useContext(SocketContext) as Socket;
	const game = useJoinGame(isConnected, socket);
	const [gameStatusMsg, setGameStatusMsg] = useState<GameStatusEventMsg>();

	useEffect(() => {
		socket.on(WsEventName.GAME_STATUS, (msg: GameStatusEventMsg) => {
			setGameStatusMsg(msg);
		});

		return () => {
			socket.off(WsEventName.GAME_STATUS);
		};
	}, []);

	const renderGame = () => {
		if (gameStatusMsg) {
			return (
				<Box alignSelf="center" marginTop={2}>
					<Text backgroundColor="yellowBright">{` ${gameStatusMsg.data.info} `}</Text>
				</Box>
			);
		}

		return (
			<Box>
				<Box>
					<Moves game={game} />
				</Box>
				<Box width="40%">
					<Events isConnected={isConnected} />
				</Box>
			</Box>
		);
	};
	return (
		<Box flexDirection="column">
			<GameInfo game={game} />
			{renderGame()}
		</Box>
	);
};
