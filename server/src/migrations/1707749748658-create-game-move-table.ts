import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateGameMoveTable1707749748658 implements MigrationInterface {
  private gamesTableName = 'games';
  private gamesMovesTableName = 'games-moves';
  private gameMoveActionEnumName = 'game_move_action';
  private gameMoveRoleEnumName = 'game_move_role';
  private gameMoveGameIdAndCreatedAtIdx = 'gameId_createdAt_index';

  public async up(queryRunner: QueryRunner): Promise<void> {
    const createGameMoveActionQuery = `
    CREATE TYPE "${this.gameMoveActionEnumName}" AS ENUM (
      'ADDED_ONE',
      'NO_ACTION',
      'SUBTRACTED_ONE'
    );
    `;
    const createGameMovePlayedByQuery = `
    CREATE TYPE "${this.gameMoveRoleEnumName}" AS ENUM (
      'PLAYER_ONE',
      'PLAYER_TWO'
    );
    `;

    await Promise.all([
      queryRunner.query(createGameMoveActionQuery),
      queryRunner.query(createGameMovePlayedByQuery),
    ]);

    const createTableQuery = `
    CREATE TABLE "${this.gamesMovesTableName}" (
      "id" uuid PRIMARY KEY NOT NULL DEFAULT gen_random_uuid(),
      "number" BIGSERIAL NOT NULL,
      "action" ${this.gameMoveActionEnumName} NOT NULL,
      "role" ${this.gameMoveRoleEnumName} NOT NULL,
      "gameId" INT NOT NULL REFERENCES ${this.gamesTableName} (id),
      "isBot" BOOLEAN NOT NULL DEFAULT FALSE,
      "createdAt" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );
    `;
    await queryRunner.query(createTableQuery);

    const indexQuery = `
    CREATE INDEX "${this.gameMoveGameIdAndCreatedAtIdx}"
    ON "${this.gamesMovesTableName}" ("gameId" DESC, "createdAt" DESC);
    `;
    await queryRunner.query(indexQuery);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex(
      this.gamesMovesTableName,
      this.gameMoveGameIdAndCreatedAtIdx,
    );
    await queryRunner.dropTable(this.gamesMovesTableName);
    await Promise.all([
      queryRunner.query(`DROP TYPE ${this.gameMoveActionEnumName}`),
      queryRunner.query(`DROP TYPE ${this.gameMoveRoleEnumName}`),
    ]);
  }
}
