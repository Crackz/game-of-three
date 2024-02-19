import { INestApplicationContext } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { EnvironmentVariables } from '../env/environment-variables';

export class SocketIoAdapter extends IoAdapter {
  constructor(
    app: INestApplicationContext,
    private configService: ConfigService<EnvironmentVariables>,
  ) {
    super(app);
  }

  createIOServer(port: number, options: ServerOptions) {
    const pingInterval = this.configService.get(
      'SERVER_SOCKET_PING_INTERVAL_IN_MS',
    );
    const pingTimeout = this.configService.get(
      'SERVER_SOCKET_PING_TIMEOUT_IN_MS',
    );

    options = { ...options, pingTimeout, pingInterval };
    const server = super.createIOServer(port, options);
    return server;
  }
}
