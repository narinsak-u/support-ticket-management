import { describe, expect, it, vi } from 'vitest';
import { RecordNotification } from './record-notification';
import type { NotificationRecordRepository } from './notification-record-repository';

describe('RecordNotification', () => {
  it('stores the ticket creation assignment with an ID and timestamp', async () => {
    const save = vi.fn<NotificationRecordRepository['save']>().mockResolvedValue();
    const recorder = new RecordNotification({ save, list: async () => ({ data: [], total: 0 }) });

    await recorder.recordTicketCreated({
      ticketId: '8d7dca0e-b858-4bb2-9367-cab72c012345',
      title: 'Cannot sign in',
      assignedTeamCode: 'ENGINEERING_TEAM',
    });

    expect(save).toHaveBeenCalledOnce();
    expect(save).toHaveBeenCalledWith({
      id: expect.stringMatching(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/),
      ticketId: '8d7dca0e-b858-4bb2-9367-cab72c012345',
      type: 'TICKET_CREATED',
      message: 'Ticket assigned to ENGINEERING_TEAM',
      createdAt: expect.any(Date),
    });
  });

  it('propagates persistence failures', async () => {
    const failure = new Error('database unavailable');
    const save = vi.fn<NotificationRecordRepository['save']>().mockRejectedValue(failure);
    const recorder = new RecordNotification({ save, list: async () => ({ data: [], total: 0 }) });

    await expect(
      recorder.recordTicketCreated({
        ticketId: '8d7dca0e-b858-4bb2-9367-cab72c012345',
        title: 'Cannot sign in',
        assignedTeamCode: 'ENGINEERING_TEAM',
      }),
    ).rejects.toBe(failure);
  });
});
