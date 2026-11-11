import type { NotificationCapability } from '../../notification/contracts/notification.contract';
import type { RoutingCapability } from '../../routing/contracts/routing.contract';
import { NewTicket, Ticket, TicketCategory, TicketStatus } from '../domain/ticket';

export interface ApplicationLogger {
  error(message: string, error: unknown): void;
}
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
}

export class CreateTicket {
  constructor(
    private readonly tickets: TicketRepository,
    private readonly routing: RoutingCapability,
    private readonly notifications: NotificationCapability,
    private readonly logger: ApplicationLogger,
  ) {}

  async execute(input: Omit<NewTicket, 'assignedTeamCode'>): Promise<Ticket> {
    Ticket.validateInput(input);
    const decision = await this.routing.determineTeam({ category: input.category, priority: input.priority });
    const ticket = Ticket.create({ ...input, assignedTeamCode: decision.teamCode });
    await this.tickets.save(ticket);
    try {
      await this.notifications.recordTicketCreated({ ticketId: ticket.id, title: ticket.title, assignedTeamCode: ticket.assignedTeamCode });
    } catch (error) {
      this.logger.error('Failed to record ticket-created notification', error);
    }
    return ticket;
  }
}

export class ListTickets {
  constructor(private readonly tickets: TicketRepository) {}

  async execute(query: { status?: TicketStatus; category?: TicketCategory; page?: number; limit?: number } = {}) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;
    const { tickets, total } = await this.tickets.list({ ...query, page, limit });
    return { data: tickets, pagination: { page, limit, total } };
  }
}

export class GetTicket {
  constructor(private readonly tickets: TicketRepository) {}

  execute(id: string): Promise<Ticket | undefined> {
    return this.tickets.findById(id);
  }
}
