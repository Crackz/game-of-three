import {Box, Text} from 'ink';
import React from 'react';
import {GameRole} from '../interfaces/game.interface.js';
import {GameMove, GameMoveAction} from '../interfaces/move.interface.js';
import {getPlayerColor} from './game-info.js';

const mapActionToName = (action: GameMoveAction) => {
	switch (action) {
		case GameMoveAction.NO_ACTION:
			return '+0';
		case GameMoveAction.ADDED_ONE:
			return '+1';
		case GameMoveAction.SUBTRACTED_ONE:
			return '-1';
		default:
			throw new Error('Unhandled Action: ' + action);
	}
};

export const Move = ({
	move,
	role,
	width,
	shouldIgnoreAction,
}: {
	move?: GameMove | null;
	role: GameRole;
	shouldIgnoreAction?: boolean;
	width: string;
}) => {
	const renderAction = () => {
		if (shouldIgnoreAction || !move) {
			return;
		}

		return <Text color="yellow">{` (${mapActionToName(move.action)})`}</Text>;
	};

	return (
		<Box width={width}>
			<Text bold color={getPlayerColor(role)}>
				{move?.number || '☐'}
			</Text>
			{renderAction()}
			{move?.isBot ? <Text color="gray"> [Bot]</Text> : ''}
		</Box>
	);
};
