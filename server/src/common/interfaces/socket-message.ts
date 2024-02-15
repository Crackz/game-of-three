import { ApiProperty } from '@nestjs/swagger';

export class WebSocketMessage {
  @ApiProperty()
  success: boolean;
}
