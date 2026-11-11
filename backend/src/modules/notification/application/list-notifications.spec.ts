import { describe, expect, it } from 'vitest';
import type { NotificationRecord, NotificationRecordRepository } from './notification-record-repository';
import { ListNotifications } from './list-notifications';

const records: NotificationRecord[] = Array.from({ length: 6 }, (_, index) => ({
  id: `notification-${index + 1}`,
  ticketId: `ticket-${index + 1}`,
  type: 'TICKET_CREATED',
  message: `Ticket ${index + 1} created`,
  createdAt: new Date(index),
}));

const repository: NotificationRecordRepository = {
  save: async () => {},
  list: async ({ page, limit }) => ({
    data: records.slice((page - 1) * limit, page * limit),
    total: records.length,
  }),
};

describe('ListNotifications', () => {
  it('returns five records by default and reports remaining total', async () => {
    const result = await new ListNotifications(repository).execute();

    expect(result.data.map(({ id }) => id)).toEqual([
      'notification-1', 'notification-2', 'notification-3', 'notification-4', 'notification-5',
    ]);
    expect(result.pagination).toEqual({ page: 1, limit: 5, total: 6 });
  });

  it('returns requested page using the supplied limit', async () => {
    const result = await new ListNotifications(repository).execute({ page: 2, limit: 5 });

    expect(result.data.map(({ id }) => id)).toEqual(['notification-6']);
    expect(result.pagination).toEqual({ page: 2, limit: 5, total: 6 });
  });
});
