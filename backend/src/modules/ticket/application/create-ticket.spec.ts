import { describe, expect, it, vi } from 'vitest';
import { NotificationCapability } from '../../notification/contracts/notification.contract';
import { RoutingCapability } from '../../routing/contracts/routing.contract';
import { CreateTicket, TicketRepository } from './create-ticket';

const input = { title: 'Cannot sign in', description: '', category: 'TECHNICAL', priority: 'HIGH' } as const;
const logger = { error: vi.fn() };

function setup(teamCode = 'ENGINEERING_TEAM') {
  const routing: RoutingCapability = { determineTeam: vi.fn().mockResolvedValue({ teamCode, reason: 'test' }) };
  const notifications: NotificationCapability = { recordTicketCreated: vi.fn().mockResolvedValue(undefined) };
  const tickets: TicketRepository = { save: vi.fn().mockResolvedValue(undefined) };
  return { useCase: new CreateTicket(tickets, routing, notifications, logger), routing, notifications, tickets };
}

describe('CreateTicket', () => {
  it('does not save or notify when routing fails', async () => {
    const deps = setup();
    vi.mocked(deps.routing.determineTeam).mockRejectedValue(new Error('routing failed'));
    await expect(deps.useCase.execute(input)).rejects.toThrow('routing failed');
    expect(deps.tickets.save).not.toHaveBeenCalled();
    expect(deps.notifications.recordTicketCreated).not.toHaveBeenCalled();
  });

  it('does not notify when persistence fails', async () => {
    const deps = setup();
    vi.mocked(deps.tickets.save).mockRejectedValue(new Error('save failed'));
    await expect(deps.useCase.execute(input)).rejects.toThrow('save failed');
    expect(deps.notifications.recordTicketCreated).not.toHaveBeenCalled();
  });

  it('returns persisted ticket when notification fails', async () => {
    const deps = setup();
    vi.mocked(deps.notifications.recordTicketCreated).mockRejectedValue(new Error('notification failed'));
    const ticket = await deps.useCase.execute(input);
    expect(ticket.assignedTeamCode).toBe('ENGINEERING_TEAM');
    expect(deps.tickets.save).toHaveBeenCalledWith(ticket);
    expect(logger.error).toHaveBeenCalledOnce();
  });

  it('uses replaceable routing capability to assign ticket', async () => {
    const deps = setup('FINANCE_TEAM');
    expect((await deps.useCase.execute({ ...input, category: 'BILLING' })).assignedTeamCode).toBe('FINANCE_TEAM');
  });
});
