import SelectInput from 'ink-select-input';
import React from 'react';
import {MakeMoveChoice} from '../interfaces/make-move.interface.js';
import {GameMoveAction, NewMoveMsg} from '../interfaces/move.interface.js';
import {Box, Text} from 'ink';

const newMoveChoices: MakeMoveChoice[] = [
	{
		label: 'Add One',
		value: GameMoveAction.ADDED_ONE,
	},
	{
		label: 'Add Zero',
		value: GameMoveAction.NO_ACTION,
	},
	{
		label: 'Subtract One',
		value: GameMoveAction.SUBTRACTED_ONE,
	},
];
export const MakeSelectMove = ({
	sendNewMove,
}: {
	sendNewMove: (newMove: NewMoveMsg) => void;
}) => {
	const handleActionSelect = (choice: MakeMoveChoice) => {
		sendNewMove({action: choice.value});
	};
	return (
		<>
			<Box>
				<Text>It's your turn! Make your move</Text>
			</Box>
			<SelectInput items={newMoveChoices} onSelect={handleActionSelect} />
		</>
	);
};
