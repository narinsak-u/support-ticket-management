import { supportTickets } from '../../../db/schema';
import { Ticket, TicketCategory, TicketPriority, TicketStatus, TeamCode } from '../domain/ticket';

export function mapTicketRow(row: typeof supportTickets.$inferSelect): Ticket {
  return Ticket.reconstitute({
    ...row,
    category: row.category as TicketCategory,
    priority: row.priority as TicketPriority,
    status: row.status as TicketStatus,
    assignedTeamCode: row.assignedTeamCode as TeamCode,
  });
}
