import { Body, Controller, Get, HttpCode, HttpStatus, Inject, NotFoundException, Param, ParseUUIDPipe, Post } from '@nestjs/common';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { CreateTicket, GetTicket, ListTickets } from '../application/create-ticket';
import { CreateTicketDto } from './create-ticket.dto';

@ApiTags('tickets')
@Controller('tickets')
export class TicketController {
  constructor(
    @Inject(CreateTicket) private readonly createTicket: CreateTicket,
    @Inject(ListTickets) private readonly listTickets: ListTickets,
    @Inject(GetTicket) private readonly getTicket: GetTicket,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ description: 'Created support ticket' })
  create(@Body() input: CreateTicketDto) {
    return this.createTicket.execute(input);
  }

  @Get()
  list() {
    return this.listTickets.execute();
  }

  @Get(':id')
  async get(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    const ticket = await this.getTicket.execute(id);
    if (!ticket) throw new NotFoundException('Ticket not found');
    return ticket;
  }
}
