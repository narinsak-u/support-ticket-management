import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { DEFAULT_PAGE_SIZE } from "../../../shared/pagination";
import { PaginationControls } from "../../../shared/ui/PaginationControls";
import { getNotifications } from "../api/notifications";

type NotificationPanelProps = {
  onSelectTicket: (id: string) => void;
};

export function NotificationPanel({ onSelectTicket }: NotificationPanelProps) {
  const [page, setPage] = useState(1);
  const limit = DEFAULT_PAGE_SIZE;
  const notificationQuery = useQuery({
    queryKey: ["notifications", { page, limit }],
    queryFn: () => getNotifications(page, limit),
    retry: false,
  });
  const notifications = notificationQuery.data?.data ?? [];
  const total = notificationQuery.data?.pagination.total ?? 0;

  return (
    <section
      className="notification-section"
      aria-labelledby="notifications-title"
    >
      <div className="section-heading">
        <div>
          <p className="eyebrow">Activity</p>
          <h2 id="notifications-title">Notifications</h2>
        </div>
      </div>
      {notificationQuery.isLoading ? (
        <p className="state-message" role="status">
          Loading notifications…
        </p>
      ) : notificationQuery.isError ? (
        <p className="state-message error-state" role="alert">
          {notificationQuery.error.message}
        </p>
      ) : notifications.length === 0 ? (
        <p className="state-message">No notification records yet.</p>
      ) : (
        <ol className="notification-list">
          {notifications.map((record) => (
            <li className="notification-item" key={record.id}>
              <span className="notification-mark" aria-hidden="true">
                •
              </span>
              <div>
                <p>{record.message}</p>
                <a
                  href={`#ticket-${record.ticketId}`}
                  onClick={(event) => {
                    event.preventDefault();
                    onSelectTicket(record.ticketId);
                  }}
                  aria-label={`View ticket ${record.ticketId}`}
                >
                  Ticket {record.ticketId}
                </a>
                <time dateTime={record.createdAt}>
                  {new Date(record.createdAt).toLocaleString()}
                </time>
              </div>
            </li>
          ))}
        </ol>
      )}
      <PaginationControls
        ariaLabel="Notification pages"
        page={page}
        total={total}
        limit={limit}
        isFetching={notificationQuery.isFetching}
        onPageChange={setPage}
      />
    </section>
  );
}
