import { TicketCategory, TicketStatus } from '../domain/ticket';
import { TicketRepository } from './ticket-repository';

export class ListTickets {
  constructor(private readonly tickets: TicketRepository) {}

  async execute(query: { status?: TicketStatus; category?: TicketCategory; page?: number; limit?: number } = {}) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 5;
    const { tickets, total } = await this.tickets.list({ ...query, page, limit });
    return { data: tickets, pagination: { page, limit, total } };
  }
}
