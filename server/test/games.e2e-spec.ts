import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { EnvironmentVariables } from 'src/common/env/environment-variables';
import { GamesRepository } from 'src/modules/games/games.repository';
import { GamesService } from 'src/modules/games/games.service';
import { GameStatus } from 'src/modules/games/interfaces/games.interface';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { TestGameSocket, TestGameSocketEvent } from './shared/test-game-socket';
import { TestUtils } from './shared/test-utils';

describe('GamesGateway (e2e)', () => {
  let app: INestApplication;
  let serverPort: number;
  let dataSource: DataSource;
  let gamesRepo: GamesRepository;
  let gamesService: GamesService;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const configService =
      moduleRef.get<ConfigService<EnvironmentVariables>>(ConfigService);
    serverPort = configService.get('SERVER_PORT');
    dataSource = moduleRef.get<DataSource>(getDataSourceToken());
    gamesRepo = moduleRef.get<GamesRepository>(GamesRepository);
    gamesService = moduleRef.get<GamesService>(GamesService);

    app = moduleRef.createNestApplication();
    await app.listen(serverPort);
  });

  beforeEach(async () => {
    jest.clearAllMocks();
  });

  afterEach(async () => {
    await Promise.all([
      TestUtils.clearAllDbTables(dataSource),
      gamesService.removeAllGamesStates(),
    ]);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should get a successful join event when active game is created automatically', async () => {
    const gameSocket = await new TestGameSocket(serverPort).connect();
    const successfulMsg = await gameSocket.joinGame();
    const games = await gamesRepo.find();

    expect(games).toHaveLength(1);
    expect(successfulMsg).toMatchObject({
      success: true,
      data: {
        game: {
          id: games[0].id,
          role: 'PLAYER_ONE',
          isNew: true,
        },
      },
    });

    await gameSocket.disconnect();
  });

  it('should get a successful join event when active game exists', async () => {
    const newGame = await gamesRepo.create({
      status: GameStatus.ACTIVE,
      info: undefined,
    });

    const gameSocket = await new TestGameSocket(serverPort).connect();
    const successfulMsg = await gameSocket.joinGame();

    expect(successfulMsg).toMatchObject({
      success: true,
      data: {
        game: {
          id: newGame.id,
          role: 'PLAYER_ONE',
          isNew: false,
        },
      },
    });

    await gameSocket.disconnect();
  });

  it('should join as a player two when the active game has another player', async () => {
    const gameSocket = await new TestGameSocket(serverPort).connect();

    const anotherGameSocket = await new TestGameSocket(serverPort).connect();
    await anotherGameSocket.joinGame();

    const successfulMsg = await gameSocket.joinGame();
    const games = await gamesRepo.find();

    expect(games).toHaveLength(1);
    expect(successfulMsg).toMatchObject({
      success: true,
      data: {
        game: {
          id: games[0].id,
          role: 'PLAYER_TWO',
          isNew: false,
        },
      },
    });

    await Promise.all([
      gameSocket.disconnect(),
      anotherGameSocket.disconnect(),
    ]);
  });

  it('should join new game when the active game is full', async () => {
    const inGameSockets = await Promise.all([
      new TestGameSocket(serverPort).connect(),
      new TestGameSocket(serverPort).connect(),
    ]);
    await Promise.all(inGameSockets.map((s) => s.joinGame()));

    const gameSocket = await new TestGameSocket(serverPort).connect();
    const successfulMsg = await gameSocket.joinGame();

    const games = await gamesRepo.find();

    expect(games).toHaveLength(2);
    expect(successfulMsg).toMatchObject({
      success: true,
      data: {
        game: {
          id: games[games.length - 1].id,
          role: 'PLAYER_ONE',
          isNew: true,
        },
      },
    });

    await Promise.all([
      ...inGameSockets.map((gameSocket) => gameSocket.disconnect()),
      gameSocket.disconnect(),
    ]);
  });

  it('should get a failed join when the user tries to join a game twice', async () => {
    const gameSocket = await new TestGameSocket(serverPort).connect();
    await gameSocket.joinGame();

    const failedMsg = await gameSocket.joinGame();

    expect(failedMsg).toMatchObject({
      success: false,
      data: {
        info: expect.any(String),
      },
    });
  });

  it('should get info msg when a new player joins the game', async () => {
    const gameSocket = await new TestGameSocket(serverPort).connect();
    await gameSocket.joinGame();

    const eventMsgPromise = gameSocket.listenOn(TestGameSocketEvent.EVENTS);

    const anotherGameSocket = await new TestGameSocket(serverPort).connect();
    await anotherGameSocket.joinGame();

    const eventMsg = await eventMsgPromise;
    expect(eventMsg).toMatchObject({
      data: {
        info: expect.any(String),
      },
    });

    await Promise.all([
      gameSocket.disconnect(),
      anotherGameSocket.disconnect(),
    ]);
  });

  it('should get info msg when a player leaves the game', async () => {
    const gameSocket = await new TestGameSocket(serverPort).connect();
    await gameSocket.joinGame();

    const anotherGameSocket = await new TestGameSocket(serverPort).connect();
    await anotherGameSocket.joinGame();

    const eventMsgPromise = gameSocket.listenOn(TestGameSocketEvent.EVENTS);

    await anotherGameSocket.disconnect();
    const eventMsg = await eventMsgPromise;

    expect(eventMsg).toMatchObject({
      data: {
        info: expect.any(String),
      },
    });

    await gameSocket.disconnect();
  });
});
