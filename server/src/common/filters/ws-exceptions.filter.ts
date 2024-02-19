import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
} from '@nestjs/common';
import { WsException } from '@nestjs/websockets';
import { Socket } from 'socket.io';
import { WsEventPath } from '../constants';

@Catch()
export class WsExceptionsFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    const socket = host.switchToWs().getClient<Socket>();
    let err: string | object;

    if (exception instanceof HttpException) {
      err = exception.getResponse();
    } else if (exception instanceof WsException) {
      err = exception.getError();
    } else {
      err = exception;
    }

    socket.emit(WsEventPath.ERROR, err);
  }
}
