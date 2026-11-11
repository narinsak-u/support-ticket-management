import { Injectable, OnModuleInit } from '@nestjs/common';
import { CreateTicket, ListTickets } from '../application/create-ticket';

const SAMPLE_TICKETS = [
  { title: 'Cannot sign in to my account', description: 'Password reset link has expired.', category: 'TECHNICAL', priority: 'HIGH' },
  { title: 'Duplicate charge on my invoice', description: 'I was charged twice for this month.', category: 'BILLING', priority: 'HIGH' },
  { title: 'Update account contact details', description: 'Please help me change the email address on my account.', category: 'GENERAL', priority: 'LOW' },
  { title: 'Application crashes on launch', description: 'The desktop application closes immediately after opening.', category: 'TECHNICAL', priority: 'CRITICAL' },
  { title: 'Question about subscription renewal', description: 'When will my current subscription renew?', category: 'BILLING', priority: 'MEDIUM' },
] as const;

@Injectable()
export class TicketSeeder implements OnModuleInit {
  constructor(private readonly listTickets: ListTickets, private readonly createTicket: CreateTicket) {}

  async onModuleInit(): Promise<void> {
    const { pagination } = await this.listTickets.execute({ page: 1, limit: 1 });
    if (pagination.total > 0) return;

    for (const ticket of SAMPLE_TICKETS) await this.createTicket.execute(ticket);
  }
}
