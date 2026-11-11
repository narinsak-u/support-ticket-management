import { Ticket } from '../domain/ticket';
import { TicketRepository } from './ticket-repository';

export class GetTicket {
  constructor(private readonly tickets: TicketRepository) {}

  execute(id: string): Promise<Ticket | undefined> {
    return this.tickets.findById(id);
  }
}
