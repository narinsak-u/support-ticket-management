import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getTicket, listTickets } from "../api/tickets";
import { TicketStatusAction } from "./TicketStatusAction";

type TicketBrowserProps = {
  selectedId: string | null;
  onSelectTicket: (id: string | null) => void;
};

export function TicketBrowser({
  selectedId,
  onSelectTicket,
}: TicketBrowserProps) {
  const queryClient = useQueryClient();
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;
  const ticketQuery = useQuery({
    queryKey: ["tickets", { category, status, page, limit }],
    queryFn: () => listTickets(category, status, page, limit),
    retry: false,
  });
  useEffect(() => {
    const total = ticketQuery.data?.pagination.total;
    if (total === undefined) return;
    const lastPage = Math.max(1, Math.ceil(total / limit));
    if (page > lastPage) {
      setPage(lastPage);
      onSelectTicket(null);
    }
  }, [ticketQuery.data?.pagination.total, page, limit, onSelectTicket]);
  const tickets = ticketQuery.data?.data ?? [];
  const activeId = selectedId ?? tickets[0]?.id ?? null;
  const detailQuery = useQuery({
    queryKey: ["ticket", activeId],
    queryFn: () => getTicket(activeId!),
    enabled: activeId !== null,
    retry: false,
  });

  return (
    <section className="browse-section" aria-labelledby="tickets-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Your queue</p>
          <h2 id="tickets-title">Support tickets</h2>
        </div>
        <span className="record-count">
          {ticketQuery.data?.pagination.total ?? 0} total
        </span>
      </div>
      <div className="ticket-controls">
        <div className="filter-fields">
          <label>
            Category
            <select
              value={category}
              onChange={(event) => {
                setCategory(event.target.value);
                setPage(1);
                onSelectTicket(null);
              }}
            >
              <option value="">All categories</option>
              <option value="TECHNICAL">Technical</option>
              <option value="BILLING">Billing</option>
              <option value="GENERAL">General</option>
            </select>
          </label>
          <label>
            Status
            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(1);
                onSelectTicket(null);
              }}
            >
              <option value="">All statuses</option>
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In progress</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </label>
        </div>
        <p className="page-count" aria-live="polite">
          {ticketQuery.data?.pagination.total
            ? `Showing ${(page - 1) * limit + 1}–${Math.min(page * limit, ticketQuery.data.pagination.total)} of ${ticketQuery.data.pagination.total}`
            : "Showing 0 of 0"}
        </p>
      </div>
      <div className="browse-grid">
        <div className="ticket-list" aria-label="Support tickets">
          {ticketQuery.isLoading ? (
            <p className="state-message" role="status">
              Loading tickets…
            </p>
          ) : ticketQuery.isError ? (
            <p className="state-message error-state" role="alert">
              {ticketQuery.error.message}
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
                  <span
                    className={`status-label status-${ticket.status.toLowerCase()}`}
                  >
                    {ticket.status.replace("_", " ")}
                  </span>
                  <span>{ticket.priority}</span>
                  <span>{ticket.assignedTeamCode}</span>
                </span>
              </button>
            ))
          )}
        </div>
        <nav className="pagination-controls" aria-label="Ticket pages">
          <button
            type="button"
            onClick={() => {
              setPage((current) => current - 1);
              onSelectTicket(null);
            }}
            disabled={page <= 1 || ticketQuery.isFetching}
          >
            Previous
          </button>
          <span>
            Page {page} of{" "}
            {Math.max(
              1,
              Math.ceil((ticketQuery.data?.pagination.total ?? 0) / limit),
            )}
          </span>
          <button
            type="button"
            onClick={() => {
              setPage((current) => current + 1);
              onSelectTicket(null);
            }}
            disabled={
              page * limit >= (ticketQuery.data?.pagination.total ?? 0) ||
              ticketQuery.isFetching
            }
          >
            Next
          </button>
        </nav>
        <section
          className="detail-panel"
          aria-labelledby="detail-title"
          aria-live="polite"
        >
          <h3 className="visually-hidden" id="detail-title">
            Ticket details
          </h3>
          {!activeId ? (
            <p className="state-message">Select a ticket to see its details.</p>
          ) : detailQuery.isLoading ? (
            <p className="state-message" role="status">
              Loading ticket details…
            </p>
          ) : detailQuery.isError ? (
            <p className="state-message error-state" role="alert">
              {detailQuery.error.message}
            </p>
          ) : detailQuery.data ? (
            <>
              <div className="detail-heading">
                <div>
                  <p className="detail-label">Ticket details</p>
                  <h3>{detailQuery.data.title}</h3>
                </div>
                <span
                  className={`status-label status-${detailQuery.data.status.toLowerCase()}`}
                >
                  {detailQuery.data.status.replace("_", " ")}
                </span>
              </div>
              <p className="detail-description">
                {detailQuery.data.description || "No description provided."}
              </p>
              <dl className="detail-facts">
                <div>
                  <dt>Category</dt>
                  <dd>{detailQuery.data.category}</dd>
                </div>
                <div>
                  <dt>Priority</dt>
                  <dd>{detailQuery.data.priority}</dd>
                </div>
                <div>
                  <dt>Assigned Team</dt>
                  <dd>{detailQuery.data.assignedTeamCode}</dd>
                </div>
                <div>
                  <dt>Created</dt>
                  <dd>
                    {new Date(detailQuery.data.createdAt).toLocaleString()}
                  </dd>
                </div>
              </dl>
              <TicketStatusAction
                key={detailQuery.data.id}
                ticketId={detailQuery.data.id}
                status={detailQuery.data.status}
                onChanged={() => {
                  queryClient.invalidateQueries({ queryKey: ["tickets"] });
                  queryClient.invalidateQueries({
                    queryKey: ["ticket", detailQuery.data.id],
                  });
                }}
              />
            </>
          ) : null}
        </section>
      </div>
    </section>
  );
}
