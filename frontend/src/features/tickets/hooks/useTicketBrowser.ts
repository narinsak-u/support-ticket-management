import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { DEFAULT_PAGE_SIZE } from "../../../shared/pagination";
import { getTicket, listTickets } from "../api/tickets";

type UseTicketBrowserOptions = {
  selectedId: string | null;
  onSelectTicket: (id: string | null) => void;
};

export function useTicketBrowser({
  selectedId,
  onSelectTicket,
}: UseTicketBrowserOptions) {
  const queryClient = useQueryClient();
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const limit = DEFAULT_PAGE_SIZE;
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

  return {
    category,
    status,
    page,
    limit,
    total,
    tickets,
    activeId,
    isLoading: ticketQuery.isLoading,
    listError: ticketQuery.isError ? ticketQuery.error : null,
    isFetching: ticketQuery.isFetching,
    detail: detailQuery.data,
    isDetailLoading: detailQuery.isLoading,
    detailError: detailQuery.isError ? detailQuery.error : null,
    onCategoryChange: (value: string) => {
      setCategory(value);
      setPage(1);
      onSelectTicket(null);
    },
    onStatusChange: (value: string) => {
      setStatus(value);
      setPage(1);
      onSelectTicket(null);
    },
    onPageChange: (nextPage: number) => {
      setPage(nextPage);
      onSelectTicket(null);
    },
    onSelectTicket,
    onStatusChanged: (ticketId: string) => {
      queryClient.invalidateQueries({ queryKey: ["tickets"] });
      queryClient.invalidateQueries({ queryKey: ["ticket", ticketId] });
    },
  };
}
