import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from './common/env/environment-variables';
import { SocketIoAdapter } from './common/adapters/socket-io.adapter';
import { ShutdownSignal } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService =
    app.get<ConfigService<EnvironmentVariables>>(ConfigService);

  app.useWebSocketAdapter(new SocketIoAdapter(app, configService));
  app.enableShutdownHooks([ShutdownSignal.SIGTERM, ShutdownSignal.SIGINT]);

  await app.listen(configService.get('SERVER_PORT'));
}
bootstrap();
