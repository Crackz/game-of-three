import { Controller, Get, Injectable, Param } from '@nestjs/common';
import { GameMoveDto } from '../dtos/game-move.dto';
import { GamesMovesService } from '../games-moves.service';
import { ApiOkResponse } from '@nestjs/swagger';

@Injectable()
@Controller('/games/:gameId/moves')
export class GamesMovesController {
  constructor(private readonly gamesMovesService: GamesMovesService) {}

  @ApiOkResponse({
    description: 'An Array Of Game Moves',
    type: GameMoveDto,
    isArray: true,
  })
  @Get()
  async viewMany(@Param('gameId') gameId: string): Promise<GameMoveDto[]> {
    return await this.gamesMovesService.viewMany(+gameId);
  }
}
