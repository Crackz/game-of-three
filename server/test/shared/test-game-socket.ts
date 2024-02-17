import { Socket, io } from 'socket.io-client';

export class TestGameSocket {
  private socket: Socket;
  constructor(private readonly serverPort: number) {}

  async connect(): Promise<TestGameSocket> {
    this.socket = io(`ws://localhost:${this.serverPort}/games`, {
      autoConnect: false,
    });
    await new Promise<Socket>((resolve) => {
      this.socket.on('connect', () => {
        resolve(this.socket);
      });
      this.socket.connect();
    });

    return this;
  }

  async joinGame(): Promise<object> {
    return await new Promise<object>((resolve) => {
      this.socket.on('join', (msg) => {
        resolve(msg);
      });

      this.socket.emit('join');
    });
  }

  async listenOn(eventName: string) {
    return await new Promise<object>((resolve) => {
      this.socket.on(eventName, (payload) => {
        resolve(payload);
      });
    });
  }

  // This is a good case for using the "using" keyword but due to the lack of support
  // I just call disconnect at the end of each test
  // (also the server disconnect all sockets on shutdown signal)
  async disconnect(): Promise<void> {
    return await new Promise<void>((resolve, reject) => {
      this.socket.on('disconnect', (err) => {
        if (err !== 'io client disconnect') {
          reject(err);
        } else {
          resolve();
        }
      });

      this.socket.disconnect();
    });
  }
}
