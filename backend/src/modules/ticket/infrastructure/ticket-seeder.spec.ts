import { describe, expect, it, vi } from 'vitest';
import type { NotificationCapability } from '../../notification/contracts/notification.contract';
import type { RoutingCapability } from '../../routing/contracts/routing.contract';
import { CreateTicket } from '../application/create-ticket';
import { ListTickets } from '../application/list-tickets';
import type { TicketRepository } from '../application/ticket-repository';
import { TicketSeeder } from './ticket-seeder';

describe('TicketSeeder', () => {
  function setup(total: number) {
    const tickets: TicketRepository = {
      save: vi.fn().mockResolvedValue(undefined),
      list: vi.fn().mockResolvedValue({ tickets: [], total }),
      findById: vi.fn().mockResolvedValue(undefined),
      updateStatus: vi.fn().mockResolvedValue(true),
    };
    const routing: RoutingCapability = { determineTeam: vi.fn().mockResolvedValue({ teamCode: 'SUPPORT_TEAM', reason: 'test' }) };
    const notifications: NotificationCapability = { recordTicketCreated: vi.fn().mockResolvedValue(undefined) };
    const createTicket = new CreateTicket(tickets, routing, notifications, { error: vi.fn() });
    const listTickets = new ListTickets(tickets);
    return { seeder: new TicketSeeder(listTickets, createTicket), tickets, notifications };
  }

  it('creates five representative tickets when the database is empty', async () => {
    const { seeder, tickets, notifications } = setup(0);

    await seeder.onModuleInit();

    expect(tickets.list).toHaveBeenCalledWith({ page: 1, limit: 1 });
    expect(tickets.save).toHaveBeenCalledTimes(5);
    expect(notifications.recordTicketCreated).toHaveBeenCalledTimes(5);
    expect(tickets.save).toHaveBeenCalledWith(expect.objectContaining({ title: 'Cannot sign in to my account' }));
    expect(tickets.save).toHaveBeenCalledWith(expect.objectContaining({ title: 'Duplicate charge on my invoice' }));
    expect(tickets.save).toHaveBeenCalledWith(expect.objectContaining({ title: 'Update account contact details' }));
    expect(tickets.save).toHaveBeenCalledWith(expect.objectContaining({ title: 'Application crashes on launch' }));
    expect(tickets.save).toHaveBeenCalledWith(expect.objectContaining({ title: 'Question about subscription renewal' }));
  });

  it('does not create tickets when the database is non-empty', async () => {
    const { seeder, tickets, notifications } = setup(1);

    await seeder.onModuleInit();

    expect(tickets.list).toHaveBeenCalledWith({ page: 1, limit: 1 });
    expect(tickets.save).not.toHaveBeenCalled();
    expect(notifications.recordTicketCreated).not.toHaveBeenCalled();
  });
});
