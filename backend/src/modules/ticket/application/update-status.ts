import { Ticket, TicketStatus } from '../domain/ticket';

export interface TicketStatusRepository {
  findById(id: string): Promise<Ticket | undefined>;
  updateStatus(ticket: Ticket, expectedStatus: TicketStatus): Promise<boolean>;
}

export class TicketStatusUseCaseError extends Error {
  constructor(readonly code: 'NOT_FOUND' | 'CONFLICT', message: string) {
    super(message);
  }
}

export class UpdateTicketStatus {
  constructor(private readonly tickets: TicketStatusRepository) {}

  async execute(id: string, status: TicketStatus): Promise<Ticket> {
    const current = await this.tickets.findById(id);
    if (!current) throw new TicketStatusUseCaseError('NOT_FOUND', 'Ticket not found');
    const updated = current.transitionTo(status);
    if (!await this.tickets.updateStatus(updated, current.status)) throw new TicketStatusUseCaseError('CONFLICT', 'Ticket status changed concurrently');
    return updated;
  }
}
