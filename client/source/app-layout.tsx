import React, {PropsWithChildren} from 'react';
import {Title} from './components/title.js';

export default function AppLayout({children}: PropsWithChildren) {
	return (
		<>
			<Title />
			{children}
		</>
	);
}
