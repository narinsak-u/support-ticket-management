import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { CreateTicket } from '../application/create-ticket';
import { CreateTicketDto } from './create-ticket.dto';

@ApiTags('tickets')
@Controller('tickets')
export class TicketController {
  constructor(private readonly createTicket: CreateTicket) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ description: 'Created support ticket' })
  create(@Body() input: CreateTicketDto) {
    return this.createTicket.execute(input);
  }
}
