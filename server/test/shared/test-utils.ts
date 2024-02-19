import Redis from 'ioredis';
import { DataSource } from 'typeorm';

export class TestUtils {
  static clearAllDbTables = async (dataSource: DataSource): Promise<void> => {
    try {
      const entities = dataSource.entityMetadatas;
      const tableNames = entities
        .map((entity) => `"${entity.tableName}"`)
        .join(', ');
      await dataSource.query(
        `TRUNCATE TABLE ${tableNames} RESTART IDENTITY CASCADE;`,
      );
    } catch (error) {
      throw new Error(`ERROR: Cleaning test database: ${error}`);
    }
  };

  static clearAllRedisKeys = async (redisClient: Redis): Promise<void> => {
    await redisClient.flushall();
  };

  // static createSocket = async (port: number): Promise<Socket> => {
  //   const socket = io(`ws://localhost:${port}/games`, { autoConnect: false });
  //   return await new Promise<Socket>((resolve) => {
  //     socket.on('connect', () => {
  //       resolve(socket);
  //     });
  //     socket.connect();
  //   });
  // };

  // static disconnectSocket = async (socket: Socket): Promise<void> => {
  //   return await new Promise<void>((resolve, reject) => {
  //     socket.on('disconnect', (err) => {
  //       if (err !== 'io client disconnect') {
  //         reject(err);
  //       } else {
  //         resolve();
  //       }
  //     });

  //     socket.disconnect();
  //   });
  // };

  // static waitForEvent = async (
  //   eventName: string,
  //   socket: Socket,
  // ): Promise<any> => {
  //   return await new Promise<any>((resolve) => {
  //     socket.on(eventName, (data) => {
  //       resolve(data);
  //     });
  //   });
  // };
}
