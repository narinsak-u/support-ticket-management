import type { Ticket } from "../types";

type TicketListProps = {
  tickets: Ticket[];
  activeId: string | null;
  isLoading: boolean;
  error: Error | null;
  onSelectTicket: (id: string) => void;
};

export function TicketList({
  tickets,
  activeId,
  isLoading,
  error,
  onSelectTicket,
}: TicketListProps) {
  return (
    <div className="ticket-list" aria-label="Support tickets">
      {isLoading ? (
        <p className="state-message" role="status">
          Loading tickets…
        </p>
      ) : error ? (
        <p className="state-message error-state" role="alert">
          {error.message}
        </p>
      ) : tickets.length === 0 ? (
        <p className="state-message">
          No tickets yet. Create a ticket to start your queue.
        </p>
      ) : (
        tickets.map((ticket) => (
          <button
            className={`ticket-row${activeId === ticket.id ? " is-selected" : ""}`}
            type="button"
            key={ticket.id}
            onClick={() => onSelectTicket(ticket.id)}
            aria-current={activeId === ticket.id ? "true" : undefined}
          >
            <span className="ticket-row-title">{ticket.title}</span>
            <span className="ticket-row-meta">
              <span className={`status-label status-${ticket.status.toLowerCase()}`}>
                {ticket.status.replace("_", " ")}
              </span>
              <span>{ticket.priority}</span>
              <span>{ticket.assignedTeamCode}</span>
            </span>
          </button>
        ))
      )}
    </div>
  );
}
