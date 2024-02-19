import {Box, Text} from 'ink';
import React from 'react';
import {Game, GameRole} from '../interfaces/game.interface.js';

export const getPlayerColor = (role: GameRole) => {
	switch (role) {
		case GameRole.PLAYER_ONE:
			return 'blue';
		case GameRole.PLAYER_TWO:
			return 'red';
		default:
			throw new Error('Unhandled role: ' + role);
	}
};
const mapRoleToName = (role: GameRole) => {
	switch (role) {
		case GameRole.PLAYER_ONE:
			return 'Player 1';
		case GameRole.PLAYER_TWO:
			return 'Player 2';
		default:
			throw new Error('Unhandled Role To Name : ' + role);
	}
};

export const GameInfo = ({game}: {game: Game | null}) => {
	if (!game) {
		return;
	}

	return (
		<Box paddingLeft={2}>
			<Text color="yellow">You're in Game </Text>
			<Text color="green">{`#${game.id}`}</Text>
			<Text color="yellow"> as a</Text>
			<Text color={getPlayerColor(game.role)}>
				{` ${mapRoleToName(game.role)}`}
			</Text>
		</Box>
	);
};
