import type { NotificationRecordRepository } from './notification-record-repository';

export class ListNotifications {
  constructor(private readonly repository: NotificationRecordRepository) {}

  async execute(query: { page?: number; limit?: number } = {}) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 5;
    const { data, total } = await this.repository.list({ page, limit });
    return { data, pagination: { page, limit, total } };
  }
}
