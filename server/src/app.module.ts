import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { validateEnvironmentVariables } from './common/env/validation';
import { envFilePaths } from './config';
import { typeormConfig } from './config/typeorm';
import { GamesModule } from './modules/games/games.module';

@Module({
  imports: [
    GamesModule,
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: envFilePaths,
      load: [typeormConfig],
      validate: validateEnvironmentVariables,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        return configService.get('typeorm');
      },
    }),
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
