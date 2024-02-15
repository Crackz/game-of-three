import { INestApplication } from '@nestjs/common';
import { AsyncApiDocumentBuilder, AsyncApiModule } from 'nestjs-asyncapi';

export class AsyncApiDoc {
  static async setup(
    servePath: string,
    serverPort: string,
    app: INestApplication<any>,
  ) {
    const asyncApiOptions = new AsyncApiDocumentBuilder()
      .setTitle('Game Of Three')
      .setVersion('1.0')
      .setDefaultContentType('application/json')
      .addServer('Ws Server', {
        url: `ws://localhost:${serverPort}/games`,
        protocol: 'socket.io',
      })
      .build();

    const asyncApiDocument = await AsyncApiModule.createDocument(
      app,
      asyncApiOptions,
    );

    await AsyncApiModule.setup(servePath, app, asyncApiDocument);
  }
}
