import { describe, expect, it } from 'vitest';
import { Ticket, TicketStatus } from '../domain/ticket';
import { UpdateTicketStatus } from './update-status';
import type { TicketRepository } from './ticket-repository';

const ticket = (status: TicketStatus) => Ticket.reconstitute({
  id: '7f7c1b7e-8a3d-4f93-9aca-2c3d7a4d5c01', title: 'Cannot sign in', description: '',
  category: 'TECHNICAL', priority: 'HIGH', status, assignedTeamCode: 'ENGINEERING_TEAM',
  createdAt: new Date('2026-01-01T00:00:00Z'),
});
const id = '7f7c1b7e-8a3d-4f93-9aca-2c3d7a4d5c01';

function setup(initial?: Ticket, update = async () => true) {
  const repository: TicketRepository = {
    save: async () => {},
    list: async () => ({ tickets: [], total: 0 }),
    findById: async () => initial,
    updateStatus: update,
  };
  return new UpdateTicketStatus(repository);
}

describe('UpdateTicketStatus', () => {
  it('persists and returns OPEN to IN_PROGRESS', async () => {
    const result = await setup(ticket('OPEN')).execute(id, 'IN_PROGRESS');
    expect(result.status).toBe('IN_PROGRESS');
  });

  it('persists IN_PROGRESS to RESOLVED', async () => {
    expect((await setup(ticket('IN_PROGRESS')).execute(id, 'RESOLVED')).status).toBe('RESOLVED');
  });

  it('rejects invalid transition with domain code', async () => {
    await expect(setup(ticket('OPEN')).execute(id, 'RESOLVED')).rejects.toMatchObject({
      code: 'INVALID_STATUS_TRANSITION', message: 'Cannot transition from OPEN to RESOLVED',
    });
  });

  it('returns not found for unknown ticket', async () => {
    await expect(setup().execute(id, 'IN_PROGRESS')).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });

  it('reports concurrent status change as conflict', async () => {
    await expect(setup(ticket('OPEN'), async () => false).execute(id, 'IN_PROGRESS')).rejects.toMatchObject({ code: 'CONFLICT' });
  });
});
