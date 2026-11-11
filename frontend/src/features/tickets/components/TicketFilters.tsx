type TicketFiltersProps = {
  category: string;
  status: string;
  page: number;
  limit: number;
  total: number;
  onCategoryChange: (value: string) => void;
  onStatusChange: (value: string) => void;
};

export function TicketFilters({
  category,
  status,
  page,
  limit,
  total,
  onCategoryChange,
  onStatusChange,
}: TicketFiltersProps) {
  return (
    <div className="ticket-controls">
      <div className="filter-fields">
        <label>
          Category
          <select value={category} onChange={(event) => onCategoryChange(event.target.value)}>
            <option value="">All categories</option>
            <option value="TECHNICAL">Technical</option>
            <option value="BILLING">Billing</option>
            <option value="GENERAL">General</option>
          </select>
        </label>
        <label>
          Status
          <select value={status} onChange={(event) => onStatusChange(event.target.value)}>
            <option value="">All statuses</option>
            <option value="OPEN">Open</option>
            <option value="IN_PROGRESS">In progress</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </label>
      </div>
      <p className="page-count" aria-live="polite">
        {total
          ? `Showing ${(page - 1) * limit + 1}–${Math.min(page * limit, total)} of ${total}`
          : "Showing 0 of 0"}
      </p>
    </div>
  );
}
