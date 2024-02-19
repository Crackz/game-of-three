import {Text} from 'ink';
import React from 'react';
import {NewMoveEventMsg} from '../interfaces/move.interface.js';

export const MoveError = ({
	invalidMoveMsg,
}: {
	invalidMoveMsg: NewMoveEventMsg | undefined;
}) => {
	if (!invalidMoveMsg) {
		return;
	}

	return <Text backgroundColor="red">{invalidMoveMsg.data.info}</Text>;
};
