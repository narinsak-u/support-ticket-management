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
