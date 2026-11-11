import type { Ticket } from "../types";
import { TicketStatusAction } from "./TicketStatusAction";

type TicketDetailPanelProps = {
  ticket: Ticket | undefined;
  isLoading: boolean;
  error: Error | null;
  onStatusChanged: (ticketId: string) => void;
};

export function TicketDetailPanel({
  ticket,
  isLoading,
  error,
  onStatusChanged,
}: TicketDetailPanelProps) {
  return (
    <section
      className="detail-panel"
      aria-labelledby="detail-title"
      aria-live="polite"
    >
      <h3 className="visually-hidden" id="detail-title">
        Ticket details
      </h3>
      {!ticket && !isLoading && !error ? (
        <p className="state-message">Select a ticket to see its details.</p>
      ) : isLoading ? (
        <p className="state-message" role="status">
          Loading ticket details…
        </p>
      ) : error ? (
        <p className="state-message error-state" role="alert">
          {error.message}
        </p>
      ) : ticket ? (
        <>
          <div className="detail-heading">
            <div>
              <p className="detail-label">Ticket details</p>
              <h3>{ticket.title}</h3>
            </div>
            <span className={`status-label status-${ticket.status.toLowerCase()}`}>
              {ticket.status.replace("_", " ")}
            </span>
          </div>
          <p className="detail-description">
            {ticket.description || "No description provided."}
          </p>
          <dl className="detail-facts">
            <div>
              <dt>Category</dt>
              <dd>{ticket.category}</dd>
            </div>
            <div>
              <dt>Priority</dt>
              <dd>{ticket.priority}</dd>
            </div>
            <div>
              <dt>Assigned Team</dt>
              <dd>{ticket.assignedTeamCode}</dd>
            </div>
            <div>
              <dt>Created</dt>
              <dd>{new Date(ticket.createdAt).toLocaleString()}</dd>
            </div>
          </dl>
          <TicketStatusAction
            key={ticket.id}
            ticketId={ticket.id}
            status={ticket.status}
            onChanged={() => onStatusChanged(ticket.id)}
          />
        </>
      ) : null}
    </section>
  );
}
