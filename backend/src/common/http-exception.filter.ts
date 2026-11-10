import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import { InvalidStatusTransitionError, TicketInputError } from '../modules/ticket/domain/ticket';
import { TicketStatusUseCaseError } from '../modules/ticket/application/update-status';

@Catch()
export class HttpErrorFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse();
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'INTERNAL_SERVER_ERROR';
    let message = 'Internal server error';

    if (exception instanceof TicketInputError) {
      status = HttpStatus.BAD_REQUEST;
      code = 'INVALID_TICKET';
      message = exception.message;
    } else if (exception instanceof InvalidStatusTransitionError) {
      status = HttpStatus.CONFLICT;
      code = exception.code;
      message = exception.message;
    } else if (exception instanceof TicketStatusUseCaseError) {
      status = exception.code === 'NOT_FOUND' ? HttpStatus.NOT_FOUND : HttpStatus.CONFLICT;
      code = exception.code;
      message = exception.message;
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      code = status === HttpStatus.BAD_REQUEST ? 'VALIDATION_ERROR'
        : status === HttpStatus.NOT_FOUND ? 'NOT_FOUND'
          : status === HttpStatus.CONFLICT ? 'CONFLICT' : 'HTTP_ERROR';
      const detail = exception.getResponse();
      message = typeof detail === 'object' && detail !== null && 'message' in detail
        ? Array.isArray(detail.message) ? detail.message.join(', ') : String(detail.message)
        : exception.message;
    }

    response.status(status).json({ error: { code, message } });
  }
}
