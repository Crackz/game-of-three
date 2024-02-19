import {Box, Text} from 'ink';
import React, {useContext, useEffect, useState} from 'react';
import {QueryObserverSuccessResult, useQuery} from 'react-query';
import {Socket} from 'socket.io-client';
import {API_HOST, WsEventName} from '../common/constants.js';
import {Game, GameRole} from '../interfaces/game.interface.js';
import {
	ErrorMsg,
	GameMove,
	GameMoveAction,
	NewMoveEventMsg,
	NewMoveMsg,
} from '../interfaces/move.interface.js';
import {getPlayerColor} from './game-info.js';
import {LoadingSpinner} from './loading.js';
import {Move} from './move.js';
import {MakeMove} from './make-move.js';
import {SocketContext} from '../contexts/socket.context.js';
import {MoveError} from './move-error.js';

export const Moves = ({game}: {game: Game | null}) => {
	if (!game) {
		return;
	}

	const socket = useContext(SocketContext) as Socket;
	const [invalidNewMoveMsg, setInvalidNewMoveMsg] = useState<
		NewMoveEventMsg | undefined
	>(undefined);
	const [isSendingNewMove, setIsSendingNewMove] = useState(false);

	const fetchMoves = (): Promise<GameMove[]> =>
		fetch(`${API_HOST}/games/${game.id}/moves`).then(res => res.json());
	const {
		isLoading,
		isRefetching,
		data: moves,
		refetch,
	} = useQuery({queryFn: fetchMoves});

	useEffect(() => {
		socket.on(WsEventName.NEW_MOVE, (newMoveMsg: NewMoveEventMsg) => {
			if (!newMoveMsg.success) {
				setInvalidNewMoveMsg(newMoveMsg);
			} else {
				setInvalidNewMoveMsg(undefined);
				refetch();
			}

			setIsSendingNewMove(false);
		});

		socket.on(WsEventName.ERROR, (error: ErrorMsg) => {
			setInvalidNewMoveMsg({
				success: false,
				data: {
					info: JSON.stringify(error),
				},
			});

			setIsSendingNewMove(false);
		});

		return () => {
			socket.off(WsEventName.NEW_MOVE);
			socket.off(WsEventName.ERROR);
		};
	});

	if (isLoading || isRefetching) {
		return <LoadingSpinner text="Loading game moves" />;
	}

	const isFirstMove = game.role === GameRole.PLAYER_ONE && moves!.length === 0;

	const sendNewMove = ({action, number}: NewMoveMsg) => {
		setIsSendingNewMove(true);
		const msg: NewMoveMsg = {};
		if (isFirstMove) {
			msg.number = number;
		} else {
			msg.action = action;
		}

		socket.emit(WsEventName.NEW_MOVE, msg);
	};

	const renderMoves = (moves: GameMove[]) => {
		const moveLines = [];
		for (let i = 0; i < moves.length; i += 2) {
			const move1 = moves[i];
			const move2 = moves[i + 1];

			const isFirstMove = i === 0;
			moveLines.push(
				<Box key={move1?.id}>
					<Move
						width="50%"
						move={move1}
						role={GameRole.PLAYER_ONE}
						shouldIgnoreAction={isFirstMove}
					/>
					<Move width="50%" move={move2} role={GameRole.PLAYER_TWO} />
				</Box>,
			);
		}

		const isEvenRows = moves.length % 2 === 0;
		if (isEvenRows) {
			moveLines.push(
				<Box key={Math.random() * 1000000}>
					<Move
						width="50%"
						role={GameRole.PLAYER_ONE}
						shouldIgnoreAction={moves.length === 0}
					/>
				</Box>,
			);
		}

		return moveLines;
	};

	return (
		<Box flexDirection="column" marginTop={1}>
			<Box>
				<Box width="50%">
					<Text color={getPlayerColor(GameRole.PLAYER_ONE)}>Player 1</Text>
				</Box>
				<Box width="50%">
					<Text color={getPlayerColor(GameRole.PLAYER_TWO)}>Player 2</Text>
				</Box>
			</Box>
			{renderMoves(moves!)}
			<MoveError invalidMoveMsg={invalidNewMoveMsg} />
			<MakeMove
				game={game}
				moves={moves!}
				isSendingNewMove={isSendingNewMove}
				sendNewMove={sendNewMove}
			/>
		</Box>
	);
};
