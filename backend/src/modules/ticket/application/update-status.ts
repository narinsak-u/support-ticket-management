import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { Ticket, TicketStatus } from '../domain/ticket';

export interface TicketStatusRepository {
  findById(id: string): Promise<Ticket | undefined>;
  updateStatus(ticket: Ticket, expectedStatus: TicketStatus): Promise<boolean>;
}

export class UpdateTicketStatus {
  constructor(private readonly tickets: TicketStatusRepository) {}

  async execute(id: string, status: TicketStatus): Promise<Ticket> {
    if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id)) {
      throw new BadRequestException('Ticket id must be a UUID');
    }
    if (!['OPEN', 'IN_PROGRESS', 'RESOLVED'].includes(status)) throw new BadRequestException('Ticket status is invalid');
    const current = await this.tickets.findById(id);
    if (!current) throw new NotFoundException('Ticket not found');
    const updated = current.transitionTo(status);
    if (!await this.tickets.updateStatus(updated, current.status)) throw new ConflictException('Ticket status changed concurrently');
    return updated;
  }
}
