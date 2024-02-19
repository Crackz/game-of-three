import {Box} from 'ink';
import React from 'react';
import {Game, GameRole} from '../interfaces/game.interface.js';
import {GameMove, NewMoveMsg} from '../interfaces/move.interface.js';
import {LoadingSpinner} from './loading.js';
import {MakeSelectMove} from './make-select-move.js';
import {MakeTypeMove} from './make-type-move.js';

export const MakeMove = ({
	game,
	moves,
	isSendingNewMove,
	sendNewMove,
}: {
	game: Game;
	moves: GameMove[];
	isSendingNewMove: boolean;
	sendNewMove: (msg: NewMoveMsg) => void;
}) => {
	const isRoleTurn =
		moves.length > 0 && moves[moves.length - 1]?.role !== game.role;

	const isFirstMove = game.role === GameRole.PLAYER_ONE && moves!.length === 0;

	if (isSendingNewMove) {
		return <LoadingSpinner text="Sending your new move" />;
	}

	const renderMoveInput = () => {
		if (isFirstMove) {
			return <MakeTypeMove sendNewMove={sendNewMove} />;
		}
		if (isRoleTurn) {
			return <MakeSelectMove sendNewMove={sendNewMove} />;
		}
		return (
			<Box>
				<LoadingSpinner text="Wait for the other player to make his move" />
			</Box>
		);
	};

	return <Box marginTop={1}>{renderMoveInput()}</Box>;
};
