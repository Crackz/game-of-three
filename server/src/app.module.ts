import { Logger, Module, OnModuleInit } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { NodeEnvironment } from './common/constants';
import { EnvironmentVariables } from './common/env/environment-variables';
import { validateEnvironmentVariables } from './common/env/validation';
import { envFilePaths } from './config';
import { typeormConfig } from './config/typeorm';
import { GamesModule } from './modules/games/games.module';
import { InMemoryModule } from './modules/in-memory/in-memory.module';
import { BullModule } from '@nestjs/bullmq';
import * as Bull from 'bullmq';
import { GamesMovesModule } from './modules/games-moves/games-moves.module';

@Module({
  imports: [
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
    InMemoryModule,
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (
        configService: ConfigService<EnvironmentVariables>,
      ): Promise<Bull.QueueOptions> => {
        return {
          connection: {
            host: configService.get('REDIS_HOST'),
            port: configService.get('REDIS_PORT'),
          },
        };
      },
    }),
    GamesModule,
    GamesMovesModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule implements OnModuleInit {
  private readonly logger = new Logger(AppModule.name);

  constructor(
    private dataSource: DataSource,
    private configService: ConfigService<EnvironmentVariables>,
  ) {}
  async onModuleInit() {
    if (
      this.configService.get('NODE_ENV') === NodeEnvironment.DEVELOPMENT ||
      this.configService.get('NODE_ENV') === NodeEnvironment.TESTING
    ) {
      await this.dataSource.runMigrations();
      this.logger.log('Migrations Are Executed');
    }
  }
}
