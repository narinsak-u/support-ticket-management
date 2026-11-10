import { Inject, Injectable } from '@nestjs/common';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { DATABASE_POOL } from '../../../db/database.module';
import { supportTickets } from '../../../db/schema';
import { Ticket } from '../domain/ticket';
import { TicketRepository } from '../application/create-ticket';

@Injectable()
export class DrizzleTicketRepository implements TicketRepository {
  private readonly db;

  constructor(@Inject(DATABASE_POOL) pool: Pool) {
    this.db = drizzle(pool);
  }

  async save(ticket: Ticket): Promise<void> {
    await this.db.insert(supportTickets).values({
      id: ticket.id,
      title: ticket.title,
      description: ticket.description,
      category: ticket.category,
      priority: ticket.priority,
      status: ticket.status,
      assignedTeamCode: ticket.assignedTeamCode,
      createdAt: ticket.createdAt,
      updatedAt: ticket.createdAt,
    });
  }
}
