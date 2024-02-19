import { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

export class HttpApiDoc {
  static setup(servePath: string, app: INestApplication<any>) {
    const options = new DocumentBuilder()
      .setTitle('Game Of Three')
      .setVersion('1.0')
      .addBearerAuth()
      .addServer('/v1')
      .build();

    const document = SwaggerModule.createDocument(app, options, {
      ignoreGlobalPrefix: true,
    });

    SwaggerModule.setup(servePath, app, document, {
      swaggerOptions: {
        persistAuthorization: true,
      },
    });
  }
}
