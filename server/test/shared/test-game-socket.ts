import { Socket, io } from 'socket.io-client';

export enum TestGameSocketEvent {
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  JOIN = 'join',
  NEW_MOVE = 'new-move',
  EVENTS = 'events',
  ERROR = 'error',
}

export class TestGameSocket {
  private socket: Socket;
  constructor(private readonly serverPort: number) {}

  async connect(): Promise<TestGameSocket> {
    this.socket = io(`ws://localhost:${this.serverPort}/games`, {
      autoConnect: false,
    });
    await new Promise<Socket>((resolve) => {
      this.socket.on(TestGameSocketEvent.CONNECT, () => {
        resolve(this.socket);
      });
      this.socket.connect();
    });

    return this;
  }

  async joinGame(): Promise<object> {
    return await new Promise<object>((resolve) => {
      this.socket.on(TestGameSocketEvent.JOIN, (msg) => {
        this.socket.off(TestGameSocketEvent.JOIN);
        resolve(msg);
      });

      this.socket.emit(TestGameSocketEvent.JOIN);
    });
  }

  async newMove(
    data: object,
    opts?: { waitForResponse: boolean },
  ): Promise<object | null> {
    return await new Promise<object | null>((resolve) => {
      if (opts?.waitForResponse) {
        this.socket.on(TestGameSocketEvent.NEW_MOVE, (msg) => {
          this.socket.off(TestGameSocketEvent.NEW_MOVE);
          resolve(msg);
        });
      }

      this.socket.emit(TestGameSocketEvent.NEW_MOVE, data);
      if (!opts?.waitForResponse) {
        resolve(null);
      }
    });
  }

  async listenOn(eventName: TestGameSocketEvent) {
    return await new Promise<object>((resolve) => {
      this.socket.on(eventName, (payload) => {
        this.socket.off(eventName);
        resolve(payload);
      });
    });
  }

  // This is a good case for using the "using" keyword but due to the lack of support
  // I just call disconnect at the end of each test
  // (also the server disconnect all sockets on shutdown signal)
  async disconnect(): Promise<void> {
    return await new Promise<void>((resolve, reject) => {
      this.socket.on(TestGameSocketEvent.DISCONNECT, (err) => {
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
