import {Box, Text} from 'ink';
import {UncontrolledTextInput} from 'ink-text-input';
import React from 'react';
import {NewMoveMsg} from '../interfaces/move.interface.js';

export const MakeTypeMove = ({
	sendNewMove,
}: {
	sendNewMove: (newMove: NewMoveMsg) => void;
}) => {
	const handleSubmit = (query: string) => {
		sendNewMove({number: query});
	};

	return (
		<Box>
			<Box marginRight={1}>
				<Text backgroundColor="yellow">Enter your first move number:</Text>
			</Box>

			<UncontrolledTextInput onSubmit={handleSubmit} />
		</Box>
	);
};
