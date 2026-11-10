import { Inject, Injectable } from '@nestjs/common';
import { and, count, desc, eq } from 'drizzle-orm';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { DATABASE_POOL } from '../../../db/database.module';
import { supportTickets } from '../../../db/schema';
import { Ticket, TicketCategory, TicketPriority, TicketStatus, TeamCode } from '../domain/ticket';
import { ListTicketQuery, TicketRepository } from '../application/create-ticket';

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

  async list(query: ListTicketQuery): Promise<{ tickets: Ticket[]; total: number }> {
    const filters = [
      query.status ? eq(supportTickets.status, query.status) : undefined,
      query.category ? eq(supportTickets.category, query.category) : undefined,
    ].filter((filter) => filter !== undefined);
    const where = filters.length ? and(...filters) : undefined;
    const [rows, [{ total }]] = await Promise.all([
      this.db.select().from(supportTickets).where(where)
        .orderBy(desc(supportTickets.createdAt), desc(supportTickets.id))
        .limit(query.limit).offset((query.page - 1) * query.limit),
      this.db.select({ total: count() }).from(supportTickets).where(where),
    ]);
    return {
      tickets: rows.map((row) => Ticket.reconstitute({
        ...row,
        category: row.category as TicketCategory,
        priority: row.priority as TicketPriority,
        status: row.status as TicketStatus,
        assignedTeamCode: row.assignedTeamCode as TeamCode,
      })),
      total,
    };
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
}
