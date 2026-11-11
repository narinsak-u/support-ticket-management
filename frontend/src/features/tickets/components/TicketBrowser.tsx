import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getTicket, listTickets } from "../api/tickets";
import { TicketDetailPanel } from "./TicketDetailPanel";
import { TicketFilters } from "./TicketFilters";
import { TicketList } from "./TicketList";
import { TicketPagination } from "./TicketPagination";

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
  const total = ticketQuery.data?.pagination.total ?? 0;
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
        <span className="record-count">{total} total</span>
      </div>
      <TicketFilters
        category={category}
        status={status}
        page={page}
        limit={limit}
        total={total}
        onCategoryChange={(value) => {
          setCategory(value);
          setPage(1);
          onSelectTicket(null);
        }}
        onStatusChange={(value) => {
          setStatus(value);
          setPage(1);
          onSelectTicket(null);
        }}
      />
      <div className="browse-grid">
        <div className="ticket-list-panel">
          <TicketList
            tickets={tickets}
            activeId={activeId}
            isLoading={ticketQuery.isLoading}
            error={ticketQuery.isError ? ticketQuery.error : null}
            onSelectTicket={onSelectTicket}
          />
          <TicketPagination
            page={page}
            total={total}
            limit={limit}
            isFetching={ticketQuery.isFetching}
            onPageChange={(nextPage) => {
              setPage(nextPage);
              onSelectTicket(null);
            }}
          />
        </div>
        <TicketDetailPanel
          ticket={detailQuery.data}
          isLoading={detailQuery.isLoading}
          error={detailQuery.isError ? detailQuery.error : null}
          onStatusChanged={(ticketId) => {
            queryClient.invalidateQueries({ queryKey: ["tickets"] });
            queryClient.invalidateQueries({ queryKey: ["ticket", ticketId] });
          }}
        />
      </div>
    </section>
  );
}
