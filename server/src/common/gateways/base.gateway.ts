import { Logger } from '@nestjs/common';
import { WebSocketServer } from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

export class BaseGateway {
  @WebSocketServer()
  protected readonly server: Server;
  protected readonly logger: Logger;

  constructor(context: string) {
    this.logger = new Logger(context);
  }

  protected getSocket(socketId: string): Socket {
    // There is a type issue it could be from socket.io or nest socket io package
    return (this.server.sockets as unknown as Map<string, any>).get(socketId);
  }
}
