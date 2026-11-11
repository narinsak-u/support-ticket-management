import type { NotificationCapability } from "../../notification/contracts/notification.contract";
import type { RoutingCapability } from "../../routing/contracts/routing.contract";
import { NewTicket, Ticket } from "../domain/ticket";
import { TicketRepository } from "./ticket-repository";

export interface ApplicationLogger {
  error(message: string, error: unknown): void;
}

export class CreateTicket {
  constructor(
    private readonly tickets: TicketRepository,
    private readonly routing: RoutingCapability,
    private readonly notifications: NotificationCapability,
    private readonly logger: ApplicationLogger,
  ) {}

  async execute(input: Omit<NewTicket, "assignedTeamCode">): Promise<Ticket> {
    Ticket.validateInput(input);
    const decision = await this.routing.determineTeam({
      category: input.category,
      priority: input.priority,
    });
    const ticket = Ticket.create({
      ...input,
      assignedTeamCode: decision.teamCode,
    });
    await this.tickets.save(ticket);
    try {
      await this.notifications.recordTicketCreated({
        ticketId: ticket.id,
        title: ticket.title,
        assignedTeamCode: ticket.assignedTeamCode,
      });
    } catch (error) {
      this.logger.error("Failed to record ticket-created notification", error);
    }
    return ticket;
  }
}
