import { Ticket, TicketCategory, TicketStatus } from '../domain/ticket';

export const TICKET_REPOSITORY = Symbol('TICKET_REPOSITORY');

export interface ListTicketQuery {
  status?: TicketStatus;
  category?: TicketCategory;
  page: number;
  limit: number;
}

export interface TicketRepository {
  save(ticket: Ticket): Promise<void>;
  list(query: ListTicketQuery): Promise<{ tickets: Ticket[]; total: number }>;
  findById(id: string): Promise<Ticket | undefined>;
  updateStatus(ticket: Ticket, expectedStatus: TicketStatus): Promise<boolean>;
}
