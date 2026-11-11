type PaginationControlsProps = {
  ariaLabel: string;
  page: number;
  total: number;
  limit: number;
  isFetching: boolean;
  onPageChange: (page: number) => void;
};

export function PaginationControls({
  ariaLabel,
  page,
  total,
  limit,
  isFetching,
  onPageChange,
}: PaginationControlsProps) {
  return (
    <nav className="pagination-controls" aria-label={ariaLabel}>
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
