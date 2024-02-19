import {
  IsDefined,
  IsEnum,
  IsInt,
  IsString,
  Min,
  ValidateIf,
} from 'class-validator';
import { GameMoveAction } from '../interfaces/games-moves.interface';
import { DIVIDE_BY } from 'src/common/constants';

export class MakeNewMoveDto {
  @ValidateIf((dto: MakeNewMoveDto) => typeof dto.number === 'undefined')
  @IsDefined()
  @IsString()
  @IsEnum(Object.values(GameMoveAction))
  action?: GameMoveAction;

  @ValidateIf((dto: MakeNewMoveDto) => typeof dto.action === 'undefined')
  @IsDefined()
  @IsInt()
  @Min(DIVIDE_BY)
  number?: number;
}
