type TicketPaginationProps = {
  page: number;
  total: number;
  limit: number;
  isFetching: boolean;
  onPageChange: (page: number) => void;
};

export function TicketPagination({
  page,
  total,
  limit,
  isFetching,
  onPageChange,
}: TicketPaginationProps) {
  return (
    <nav className="pagination-controls" aria-label="Ticket pages">
      <button
        type="button"
        onClick={() => onPageChange(page - 1)}
        disabled={page <= 1 || isFetching}
      >
        Previous
      </button>
      <span>
        Page {page} of {Math.max(1, Math.ceil(total / limit))}
      </span>
      <button
        type="button"
        onClick={() => onPageChange(page + 1)}
        disabled={page * limit >= total || isFetching}
      >
        Next
      </button>
    </nav>
  );
}
