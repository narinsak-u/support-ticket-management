import { useTicketBrowser } from "../hooks/useTicketBrowser";
import { TicketDetailPanel } from "./TicketDetailPanel";
import { TicketFilters } from "./TicketFilters";
import { TicketList } from "./TicketList";
import { PaginationControls } from "../../../shared/ui/PaginationControls";

type TicketBrowserProps = {
  selectedId: string | null;
  onSelectTicket: (id: string | null) => void;
};

export function TicketBrowser({
  selectedId,
  onSelectTicket,
}: TicketBrowserProps) {
  const browser = useTicketBrowser({ selectedId, onSelectTicket });

  return (
    <section className="browse-section" aria-labelledby="tickets-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">Your queue</p>
          <h2 id="tickets-title">Support tickets</h2>
        </div>
        <span className="record-count">{browser.total} total</span>
      </div>
      <TicketFilters
        category={browser.category}
        status={browser.status}
        page={browser.page}
        limit={browser.limit}
        total={browser.total}
        onCategoryChange={browser.onCategoryChange}
        onStatusChange={browser.onStatusChange}
      />
      <div className="browse-grid">
        <div className="ticket-list-panel">
          <TicketList
            tickets={browser.tickets}
            activeId={browser.activeId}
            isLoading={browser.isLoading}
            error={browser.listError}
            onSelectTicket={browser.onSelectTicket}
          />
          <PaginationControls
            ariaLabel="Ticket pages"
            page={browser.page}
            total={browser.total}
            limit={browser.limit}
            isFetching={browser.isFetching}
            onPageChange={browser.onPageChange}
          />
        </div>
        <TicketDetailPanel
          ticket={browser.detail}
          isLoading={browser.isDetailLoading}
          error={browser.detailError}
          onStatusChanged={browser.onStatusChanged}
        />
      </div>
    </section>
  );
}
