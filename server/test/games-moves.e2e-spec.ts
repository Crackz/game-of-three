import { INestApplication } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { getDataSourceToken } from '@nestjs/typeorm';
import { EnvironmentVariables } from 'src/common/env/environment-variables';
import { GamesMovesService } from 'src/modules/games-moves/games-moves.service';
import { GamesService } from 'src/modules/games/games.service';
import { DataSource } from 'typeorm';
import { AppModule } from '../src/app.module';
import { TestGameSocket, TestGameSocketEvent } from './shared/test-game-socket';
import { TestUtils } from './shared/test-utils';

describe('GamesMovesGateway (e2e)', () => {
  let app: INestApplication;
  let serverPort: number;
  let dataSource: DataSource;
  let gamesMovesService: GamesMovesService;
  let gamesService: GamesService;

  beforeAll(async () => {
    const moduleRef: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    const configService =
      moduleRef.get<ConfigService<EnvironmentVariables>>(ConfigService);
    serverPort = configService.get('SERVER_PORT');
    dataSource = moduleRef.get<DataSource>(getDataSourceToken());
    gamesMovesService = moduleRef.get<GamesMovesService>(GamesMovesService);
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
      gamesMovesService.removeAllGamesMoves(),
    ]);
  });

  afterAll(async () => {
    await app.close();
  });

  it('should get a successful new move event when the user plays the first move', async () => {
    const gameSocket = await new TestGameSocket(serverPort).connect();
    await gameSocket.joinGame();

    const number = 100;
    const newMove = await gameSocket.newMove(
      { number },
      { waitForResponse: true },
    );

    expect(newMove).toMatchObject({
      success: true,
      data: {
        move: {
          action: 'NO_ACTION',
          number,
          role: 'PLAYER_ONE',
        },
      },
    });

    await gameSocket.disconnect();
  });

  it('should get a successful new move for both players when player1 plays the first move', async () => {
    const playerOneGameSocket = await new TestGameSocket(serverPort).connect();
    await playerOneGameSocket.joinGame();

    const playerTwoGameSocket = await new TestGameSocket(serverPort).connect();
    await playerTwoGameSocket.joinGame();

    const playerOneNewMoveMsgPromise = playerOneGameSocket.listenOn(
      TestGameSocketEvent.NEW_MOVE,
    );
    const playerTwoNewMoveMsgPromise = playerTwoGameSocket.listenOn(
      TestGameSocketEvent.NEW_MOVE,
    );

    const number = 100;
    await playerOneGameSocket.newMove({ number });

    const playerOneNewMoveMsg = await playerOneNewMoveMsgPromise;
    const playerTwoNewMoveMsg = await playerTwoNewMoveMsgPromise;

    const expectedFirstMoveMsg = {
      success: true,
      data: {
        move: {
          action: 'NO_ACTION',
          number,
          role: 'PLAYER_ONE',
        },
      },
    };
    expect(playerOneNewMoveMsg).toMatchObject(expectedFirstMoveMsg);
    expect(playerTwoNewMoveMsg).toMatchObject(expectedFirstMoveMsg);

    await Promise.all([
      playerOneGameSocket.disconnect(),
      playerTwoGameSocket.disconnect(),
    ]);
  });

  it('should get a successful new move for both players when player2 plays after the first move', async () => {
    const playerOneGameSocket = await new TestGameSocket(serverPort).connect();
    await playerOneGameSocket.joinGame();

    const playerTwoGameSocket = await new TestGameSocket(serverPort).connect();
    await playerTwoGameSocket.joinGame();

    const playerOneNewMoveMsgPromise = playerOneGameSocket.listenOn(
      TestGameSocketEvent.NEW_MOVE,
    );
    const playerTwoNewMoveMsgPromise = playerTwoGameSocket.listenOn(
      TestGameSocketEvent.NEW_MOVE,
    );

    const number = 99;
    await playerOneGameSocket.newMove({ number });

    await Promise.all([playerOneNewMoveMsgPromise, playerTwoNewMoveMsgPromise]);

    const action = 'NO_ACTION';
    await playerTwoGameSocket.newMove({ action });

    const [playerOneNewMoveMsg, playerTwoNewMoveMsg] = await Promise.all([
      playerOneGameSocket.listenOn(TestGameSocketEvent.NEW_MOVE),
      playerTwoGameSocket.listenOn(TestGameSocketEvent.NEW_MOVE),
    ]);

    const expectedFirstMoveMsg = {
      success: true,
      data: {
        move: {
          action: action,
          number: expect.any(Number),
          role: 'PLAYER_TWO',
        },
      },
    };
    expect(playerOneNewMoveMsg).toMatchObject(expectedFirstMoveMsg);
    expect(playerTwoNewMoveMsg).toMatchObject(expectedFirstMoveMsg);

    await Promise.all([
      playerOneGameSocket.disconnect(),
      playerTwoGameSocket.disconnect(),
    ]);
  });

  it("should get a failed move event when the user doesn't join a game first", async () => {
    const gameSocket = await new TestGameSocket(serverPort).connect();

    const failedNewMoveMsg = await gameSocket.newMove(
      { number: 100 },
      { waitForResponse: true },
    );

    expect(failedNewMoveMsg).toMatchObject({
      success: false,
      data: {
        info: "You can't make a move unless you're in a game",
      },
    });

    await gameSocket.disconnect();
  });

  it("should get a failed move event when the user doesn't provide a number on the first move", async () => {
    const gameSocket = await new TestGameSocket(serverPort).connect();
    await gameSocket.joinGame();

    const failedNewMoveMsg = await gameSocket.newMove(
      { action: 'NO_ACTION' },
      { waitForResponse: true },
    );

    expect(failedNewMoveMsg).toMatchObject({
      success: false,
      data: {
        info: 'You should send a number for the first move',
      },
    });

    await gameSocket.disconnect();
  });

  it('should get a failed move event when the user is joined as player two and tries to make the first move', async () => {
    const playerOneGameSocket = await new TestGameSocket(serverPort).connect();
    await playerOneGameSocket.joinGame();

    const playerTwoGameSocket = await new TestGameSocket(serverPort).connect();
    await playerTwoGameSocket.joinGame();

    const action = 'NO_ACTION';
    const failedNewMoveMsg = await playerTwoGameSocket.newMove(
      { action },
      { waitForResponse: true },
    );

    expect(failedNewMoveMsg).toMatchObject({
      success: false,
      data: {
        info: 'Only the player one can make the first move',
      },
    });
    await Promise.all([
      playerOneGameSocket.disconnect(),
      playerTwoGameSocket.disconnect(),
    ]);
  });

  it("should get a failed move event when the user isn't not his turn", async () => {
    const playerOneGameSocket = await new TestGameSocket(serverPort).connect();
    await playerOneGameSocket.joinGame();

    const playerTwoGameSocket = await new TestGameSocket(serverPort).connect();
    await playerTwoGameSocket.joinGame();

    await playerOneGameSocket.newMove(
      { number: 1000 },
      { waitForResponse: true },
    );

    const failedNewMoveMsg = await playerOneGameSocket.newMove(
      { action: 'ADDED_ONE' },
      { waitForResponse: true },
    );

    expect(failedNewMoveMsg).toMatchObject({
      success: false,
      data: {
        info: 'Wait for the other player to make his move',
      },
    });
    await Promise.all([
      playerOneGameSocket.disconnect(),
      playerTwoGameSocket.disconnect(),
    ]);
  });

  it('should get a failed move event when the user tries to make an invalid action', async () => {
    const playerOneGameSocket = await new TestGameSocket(serverPort).connect();
    await playerOneGameSocket.joinGame();

    const playerTwoGameSocket = await new TestGameSocket(serverPort).connect();
    await playerTwoGameSocket.joinGame();

    const newMoveMsgPromise = playerTwoGameSocket.listenOn(
      TestGameSocketEvent.NEW_MOVE,
    );

    await playerOneGameSocket.newMove(
      { number: 99 },
      { waitForResponse: true },
    );
    await newMoveMsgPromise;

    const failedNewMoveMsg = await playerTwoGameSocket.newMove(
      { action: 'ADDED_ONE' },
      { waitForResponse: true },
    );

    expect(failedNewMoveMsg).toMatchObject({
      success: false,
      data: {
        info: expect.any(String),
      },
    });

    await Promise.all([
      playerOneGameSocket.disconnect(),
      playerTwoGameSocket.disconnect(),
    ]);
  });

  it("should get an error event when the user doesn't send a number or an action", async () => {
    const gameSocket = await new TestGameSocket(serverPort).connect();
    await gameSocket.joinGame();

    const errorMsgPromise = gameSocket.listenOn(TestGameSocketEvent.ERROR);
    await gameSocket.newMove({});

    const errorMsg = await errorMsgPromise;
    expect(errorMsg).toHaveProperty('errors');

    await gameSocket.disconnect();
  });

  it('should get an error event when the user sends invalid number', async () => {
    const gameSocket = await new TestGameSocket(serverPort).connect();
    await gameSocket.joinGame();

    const errorMsgPromise = gameSocket.listenOn(TestGameSocketEvent.ERROR);
    await gameSocket.newMove({ number: 'INVALID' });

    const errorMsg = await errorMsgPromise;
    expect(errorMsg).toHaveProperty('errors');

    await gameSocket.disconnect();
  });

  it('should get an error event when the user sends invalid action', async () => {
    const gameSocket = await new TestGameSocket(serverPort).connect();
    await gameSocket.joinGame();

    const errorMsgPromise = gameSocket.listenOn(TestGameSocketEvent.ERROR);
    await gameSocket.newMove({ action: 'INVALID' });

    const errorMsg = await errorMsgPromise;
    expect(errorMsg).toHaveProperty('errors');

    await gameSocket.disconnect();
  });
});
