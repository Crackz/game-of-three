import Spinner from 'ink-spinner';
import React from 'react';
import {Text} from 'ink';

export const LoadingSpinner = ({text}: {text: string}) => {
	return (
		<Text>
			<Text color="green">
				<Spinner type="dots" />
			</Text>
			{` ${text}`}
		</Text>
	);
};
