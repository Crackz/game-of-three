import React from 'react';
import {QueryClient, QueryClientProvider} from 'react-query';
import AppLayout from './app-layout.js';
import {Connecting} from './components/connecting.js';
import {GameInfo} from './components/game-info.js';
import {Moves} from './components/moves.js';
import {SocketContext} from './contexts/socket.context.js';
import {useJoinGame} from './hooks/join.hook.js';
import {useSocket} from './hooks/socket.hook.js';
import {Game} from './game.js';
const queryClient = new QueryClient();

export default function App() {
	const [isConnected, socket] = useSocket();

	if (!isConnected) {
		return (
			<>
				<AppLayout>
					<Connecting />
				</AppLayout>
			</>
		);
	}

	return (
		<QueryClientProvider client={queryClient}>
			<SocketContext.Provider value={socket}>
				<AppLayout>
					<Game isConnected={isConnected} />
				</AppLayout>
			</SocketContext.Provider>
		</QueryClientProvider>
	);
}
