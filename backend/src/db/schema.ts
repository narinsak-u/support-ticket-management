import { sql } from 'drizzle-orm';
import { check, pgSchema, uuid, varchar, text, timestamp } from 'drizzle-orm/pg-core';

const tickets = pgSchema('tickets');
const notifications = pgSchema('notifications');

export const supportTickets = tickets.table(
  'tickets',
  {
    id: uuid('id').primaryKey(),
    title: varchar('title', { length: 150 }).notNull(),
    description: text('description').notNull(),
    category: varchar('category', { length: 20 }).notNull(),
    priority: varchar('priority', { length: 20 }).notNull(),
    status: varchar('status', { length: 20 }).notNull(),
    assignedTeamCode: varchar('assigned_team_code', { length: 40 }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
  },
  (table) => [
    check('tickets_category_check', sql`${table.category} IN ('TECHNICAL', 'BILLING', 'GENERAL')`),
    check('tickets_priority_check', sql`${table.priority} IN ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL')`),
    check('tickets_status_check', sql`${table.status} IN ('OPEN', 'IN_PROGRESS', 'RESOLVED')`),
  ],
);

export const notificationRecords = notifications.table('notifications', {
  id: uuid('id').primaryKey(),
  ticketId: uuid('ticket_id').notNull(),
  type: varchar('type', { length: 40 }).notNull(),
  message: text('message').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
});
