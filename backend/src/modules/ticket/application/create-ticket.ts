import type { NotificationCapability } from '../../notification/contracts/notification.contract';
import type { RoutingCapability } from '../../routing/contracts/routing.contract';
import { NewTicket, Ticket } from '../domain/ticket';

export interface ApplicationLogger {
  error(message: string, error: unknown): void;
}

export const TICKET_REPOSITORY = Symbol('TICKET_REPOSITORY');

export interface TicketRepository {
  save(ticket: Ticket): Promise<void>;
  list(page: number, limit: number): Promise<{ tickets: Ticket[]; total: number }>;
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
    const ticket = Ticket.create({ ...input, assignedTeamCode: decision.teamCode as NewTicket['assignedTeamCode'] });
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

  async execute() {
    const { tickets, total } = await this.tickets.list(1, 20);
    return { data: tickets, pagination: { page: 1, limit: 20, total } };
  }
}

export class GetTicket {
  constructor(private readonly tickets: TicketRepository) {}

  execute(id: string): Promise<Ticket | undefined> {
    return this.tickets.findById(id);
  }
}
