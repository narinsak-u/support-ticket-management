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

export interface NotificationListQuery {
  page: number;
  limit: number;
}

export interface NotificationRecordRepository {
  save(record: NotificationRecord): Promise<void>;
  list(query: NotificationListQuery): Promise<{ data: NotificationRecord[]; total: number }>;
}

export class ListNotifications {
  constructor(private readonly repository: NotificationRecordRepository) {}

  async execute(query: { page?: number; limit?: number } = {}) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 5;
    const { data, total } = await this.repository.list({ page, limit });
    return { data, pagination: { page, limit, total } };
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
