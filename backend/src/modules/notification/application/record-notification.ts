import { randomUUID } from 'node:crypto';
import { NotificationCapability } from '../contracts/notification.contract';

export const NOTIFICATION_RECORD_REPOSITORY = Symbol('NOTIFICATION_RECORD_REPOSITORY');

export interface NotificationRecord {
  id: string;
  ticketId: string;
  type: string;
  message: string;
  createdAt: Date;
}

export interface NotificationRecordRepository {
  save(record: NotificationRecord): Promise<void>;
  findMany(): Promise<NotificationRecord[]>;
}

export class ListNotifications {
  constructor(private readonly repository: NotificationRecordRepository) {}

  async execute(): Promise<{ data: NotificationRecord[] }> {
    return { data: await this.repository.findMany() };
  }
}

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
