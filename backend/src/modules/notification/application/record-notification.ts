import { randomUUID } from 'node:crypto';
import { NotificationCapability } from '../contracts/notification.contract';
import type { NotificationRecordRepository } from './notification-record-repository';

export class RecordNotification implements NotificationCapability {
  constructor(private readonly repository: NotificationRecordRepository) {}

  async recordTicketCreated(input: {
    ticketId: string;
    title: string;
    assignedTeamCode: string;
  }): Promise<void> {
    await this.repository.save({
      id: randomUUID(),
      ticketId: input.ticketId,
      type: 'TICKET_CREATED',
      message: `Ticket assigned to ${input.assignedTeamCode}`,
      createdAt: new Date(),
    });
  }
}
