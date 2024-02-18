import { ShutdownSignal } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SocketIoAdapter } from './common/adapters/socket-io.adapter';
import { EnvironmentVariables } from './common/env/environment-variables';
import { DefaultValidationPipe } from './common/pipes/default-validation.pipe';
import { AsyncApiDoc } from './common/utils/async-api';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService =
    app.get<ConfigService<EnvironmentVariables>>(ConfigService);
  const serverPort = configService.get('SERVER_PORT');

  await AsyncApiDoc.setup('/websocket-docs', serverPort, app);

  app.useGlobalPipes(new DefaultValidationPipe());
  app.useWebSocketAdapter(new SocketIoAdapter(app, configService));
  app.enableShutdownHooks([ShutdownSignal.SIGTERM, ShutdownSignal.SIGINT]);

  await app.listen(serverPort);
}
bootstrap();
