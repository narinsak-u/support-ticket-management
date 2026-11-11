import { describe, expect, it } from 'vitest';
import { Ticket, TicketCategory, TicketPriority, TeamCode } from './ticket';

const input = {
  title: 'Cannot sign in', description: '', category: 'TECHNICAL',
  priority: 'HIGH', assignedTeamCode: 'ENGINEERING_TEAM',
} as const;

describe('Ticket domain', () => {
  it('accepts Unicode characters by code point and rejects blank or overlong titles', () => {
    const title = '😀'.repeat(150);
    expect(Ticket.create({ ...input, title }).title).toBe(title);
    expect(() => Ticket.create({ ...input, title: '  ' })).toThrow('Title must be non-empty');
    expect(() => Ticket.create({ ...input, title: 'a'.repeat(151) })).toThrow('at most 150 characters');
    expect(() => Ticket.create({ ...input, title: '😀'.repeat(151) })).toThrow('at most 150 characters');
  });

  it('bounds description by Unicode characters and rejects invalid category, priority, or Team', () => {
    const description = '😀'.repeat(2000);
    expect(Ticket.create({ ...input, description }).description).toBe(description);
    expect(() => Ticket.create({ ...input, description: 'x'.repeat(2001) })).toThrow('at most 2000 characters');
    expect(() => Ticket.create({ ...input, category: 'OTHER' as TicketCategory })).toThrow('Category is invalid');
    expect(() => Ticket.create({ ...input, priority: 'OTHER' as TicketPriority })).toThrow('Priority is invalid');
    expect(() => Ticket.create({ ...input, assignedTeamCode: 'OTHER' as TeamCode })).toThrow('Assigned team is invalid');
  });

  it('starts OPEN and only permits each forward transition once', () => {
    const open = Ticket.create(input);
    expect(open.status).toBe('OPEN');
    expect(() => open.transitionTo('RESOLVED')).toThrow('Cannot transition from OPEN to RESOLVED');
    const inProgress = open.transitionTo('IN_PROGRESS');
    expect(inProgress.status).toBe('IN_PROGRESS');
    const resolved = inProgress.transitionTo('RESOLVED');
    expect(resolved.status).toBe('RESOLVED');
    expect(() => resolved.transitionTo('OPEN')).toThrow('Cannot transition from RESOLVED to OPEN');
  });
});
