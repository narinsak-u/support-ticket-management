import { Inject, Injectable } from '@nestjs/common';
import { and, eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { DATABASE_POOL } from '../../../db/database.module';
import { supportTickets } from '../../../db/schema';
import { Ticket, TicketCategory, TicketPriority, TicketStatus, TeamCode } from '../domain/ticket';
import { TicketStatusRepository } from '../application/update-status';

@Injectable()
export class DrizzleTicketStatusRepository implements TicketStatusRepository {
  private readonly db;

  constructor(@Inject(DATABASE_POOL) pool: Pool) {
    this.db = drizzle(pool);
  }

  async findById(id: string): Promise<Ticket | undefined> {
    const [row] = await this.db.select().from(supportTickets).where(eq(supportTickets.id, id)).limit(1);
    return row ? Ticket.reconstitute({
      ...row,
      category: row.category as TicketCategory,
      priority: row.priority as TicketPriority,
      status: row.status as TicketStatus,
      assignedTeamCode: row.assignedTeamCode as TeamCode,
    }) : undefined;
  }

  async updateStatus(ticket: Ticket, expectedStatus: TicketStatus): Promise<boolean> {
    const rows = await this.db.update(supportTickets).set({ status: ticket.status, updatedAt: new Date() })
      .where(and(eq(supportTickets.id, ticket.id), eq(supportTickets.status, expectedStatus)))
      .returning({ id: supportTickets.id });
    return rows.length === 1;
  }
}
