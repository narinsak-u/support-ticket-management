import { randomUUID } from 'node:crypto';
export const TICKET_CATEGORIES = ['TECHNICAL', 'BILLING', 'GENERAL'] as const;
export type TicketCategory = (typeof TICKET_CATEGORIES)[number];

export const TICKET_PRIORITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;
export type TicketPriority = (typeof TICKET_PRIORITIES)[number];

export const TEAM_CODES = ['INCIDENT_TEAM', 'ENGINEERING_TEAM', 'FINANCE_TEAM', 'SUPPORT_TEAM'] as const;
export type TeamCode = (typeof TEAM_CODES)[number];

export type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';

export class TicketInputError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TicketInputError';
  }
}

export class InvalidStatusTransitionError extends Error {
  readonly code = 'INVALID_STATUS_TRANSITION';

  constructor(current: TicketStatus, next: TicketStatus) {
    super(`Cannot transition from ${current} to ${next}`);
    this.name = 'InvalidStatusTransitionError';
  }
}

export interface NewTicket {
  title: string;
  description: string;
  category: TicketCategory;
  priority: TicketPriority;
  assignedTeamCode: TeamCode;
}

// PostgreSQL varchar counts Unicode code points, not UTF-16 code units.
function exceedsCharacterLimit(value: string, max: number): boolean {
  if (value.length <= max) return false;
  let count = 0;
  for (let offset = 0; offset < value.length;) {
    if (++count > max) return true;
    offset += value.codePointAt(offset)! > 0xffff ? 2 : 1;
  }
  return false;
}

export class Ticket {
  private constructor(
    readonly id: string,
    readonly title: string,
    readonly description: string,
    readonly category: TicketCategory,
    readonly priority: TicketPriority,
    readonly status: TicketStatus,
    readonly assignedTeamCode: TeamCode,
    readonly createdAt: Date,
  ) {}

  static validateInput(input: Omit<NewTicket, 'assignedTeamCode'>): void {
    if (!input.title.trim() || exceedsCharacterLimit(input.title, 150)) throw new TicketInputError('Title must be non-empty and at most 150 characters');
    if (exceedsCharacterLimit(input.description, 2000)) throw new TicketInputError('Description must be at most 2000 characters');
    if (!TICKET_CATEGORIES.includes(input.category)) throw new TicketInputError('Category is invalid');
    if (!TICKET_PRIORITIES.includes(input.priority)) throw new TicketInputError('Priority is invalid');
  }

  static reconstitute(input: {
    id: string;
    title: string;
    description: string;
    category: TicketCategory;
    priority: TicketPriority;
    status: TicketStatus;
    assignedTeamCode: TeamCode;
    createdAt: Date;
  }): Ticket {
    return new Ticket(input.id, input.title, input.description, input.category, input.priority, input.status, input.assignedTeamCode, input.createdAt);
  }

  transitionTo(status: TicketStatus): Ticket {
    const nextStatus: Partial<Record<TicketStatus, TicketStatus>> = { OPEN: 'IN_PROGRESS', IN_PROGRESS: 'RESOLVED' };
    if (nextStatus[this.status] !== status) throw new InvalidStatusTransitionError(this.status, status);
    return new Ticket(this.id, this.title, this.description, this.category, this.priority, status, this.assignedTeamCode, this.createdAt);
  }

  static create(input: NewTicket): Ticket {
    this.validateInput(input);
    if (!TEAM_CODES.includes(input.assignedTeamCode)) throw new TicketInputError('Assigned team is invalid');
    return new Ticket(randomUUID(), input.title, input.description, input.category, input.priority, 'OPEN', input.assignedTeamCode, new Date());
  }

}
