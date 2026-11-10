import { randomUUID } from 'node:crypto';
import { Inject, Injectable } from '@nestjs/common';
import { NotificationCapability } from '../contracts/notification.contract';

export const NOTIFICATION_RECORD_REPOSITORY = Symbol('NOTIFICATION_RECORD_REPOSITORY');

export interface NotificationRecordRepository {
  save(record: {
    id: string;
    ticketId: string;
    type: 'TICKET_CREATED';
    message: string;
    createdAt: Date;
  }): Promise<void>;
}

@Injectable()
export class RecordNotification implements NotificationCapability {
  constructor(
    @Inject(NOTIFICATION_RECORD_REPOSITORY)
    private readonly repository: NotificationRecordRepository,
  ) {}

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
