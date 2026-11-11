import { Body, Controller, Get, HttpCode, HttpStatus, Inject, NotFoundException, Param, ParseUUIDPipe, Post, Query } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBody, ApiCreatedResponse, ApiInternalServerErrorResponse, ApiNotFoundResponse, ApiOkResponse, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CreateTicket, GetTicket, ListTickets } from '../application/create-ticket';
import { CreateTicketDto } from './create-ticket.dto';
import { ListQueryDto } from './list-query.dto';
import { ErrorEnvelopeDto, TicketListResponseDto, TicketResponseDto } from '../../../common/http-response.dto';
import { TICKET_CATEGORIES } from '../domain/ticket';

@ApiTags('tickets')
@ApiBadRequestResponse({ type: ErrorEnvelopeDto })
@ApiInternalServerErrorResponse({ type: ErrorEnvelopeDto })
@Controller('tickets')
export class TicketController {
  constructor(
    @Inject(CreateTicket) private readonly createTicket: CreateTicket,
    @Inject(ListTickets) private readonly listTickets: ListTickets,
    @Inject(GetTicket) private readonly getTicket: GetTicket,
  ) {}

  @Post()
  @ApiBody({ type: CreateTicketDto })
  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({ description: 'Created support ticket', type: TicketResponseDto })
  create(@Body() input: CreateTicketDto) {
    return this.createTicket.execute(input);
  }

  @Get()
  @ApiQuery({ name: 'status', required: false, enum: ['OPEN', 'IN_PROGRESS', 'RESOLVED'] })
  @ApiQuery({ name: 'category', required: false, enum: TICKET_CATEGORIES })
  @ApiQuery({ name: 'page', required: false, type: Number, minimum: 1, example: 1 })
  @ApiQuery({ name: 'limit', required: false, type: Number, minimum: 1, maximum: 100, example: 5 })
  @ApiOkResponse({ type: TicketListResponseDto })
  list(@Query() query: ListQueryDto) {
    return this.listTickets.execute(query);
  }

  @Get(':id')
  @ApiParam({ name: 'id', format: 'uuid' })
  @ApiOkResponse({ type: TicketResponseDto })
  @ApiNotFoundResponse({ type: ErrorEnvelopeDto })
  async get(@Param('id', new ParseUUIDPipe({ version: '4' })) id: string) {
    const ticket = await this.getTicket.execute(id);
    if (!ticket) throw new NotFoundException('Ticket not found');
    return ticket;
  }
}
