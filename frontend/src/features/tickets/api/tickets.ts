import type { Ticket, TicketInput } from "../types";
import { apiUrl } from '../../../shared/api/client';

async function requestJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Could not load tickets. Try again.");
  return response.json() as Promise<T>;
}

export async function listTickets(
  category: string,
  status: string,
  page: number,
  limit: number,
) {
  return requestJson<{
    data: Ticket[];
    pagination: { page: number; limit: number; total: number };
  }>(
    apiUrl(`/api/v1/tickets?category=${category}&status=${status}&page=${page}&limit=${limit}`),
  );
}

export async function getTicket(id: string) {
  return requestJson<Ticket>(apiUrl(`/api/v1/tickets/${id}`));
}

export async function createTicket(input: TicketInput): Promise<Ticket> {
  const response = await fetch(apiUrl('/api/v1/tickets'), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    const error =
      typeof body === "object" && body !== null && "error" in body
        ? body.error
        : null;
    const message =
      typeof error === "object" && error !== null && "message" in error
        ? error.message
        : null;
    const fallback = "Ticket could not be created. Try again.";
    const safeMessage =
      response.status < 500
        ? Array.isArray(message) &&
          message.every((part): part is string => typeof part === "string")
          ? message.join(" ")
          : typeof message === "string"
            ? message
            : fallback
        : fallback;
    throw new Error(safeMessage);
  }
  return response.json() as Promise<Ticket>;
}

export async function updateTicketStatus(
  ticketId: string,
  status: Ticket["status"],
) {
  const response = await fetch(
    apiUrl(`/api/v1/tickets/${encodeURIComponent(ticketId)}/status`),
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    },
  );
  if (!response.ok) {
    if (response.status >= 500)
      throw new Error("Could not update ticket status. Try again.");
    const body = (await response.json().catch(() => null)) as {
      error?: { message?: string };
      message?: string | string[];
    } | null;
    const message =
      body?.error?.message ??
      (Array.isArray(body?.message) ? body.message.join(" ") : body?.message);
    throw new Error(
      message ||
        (response.status === 409
          ? "Ticket status changed elsewhere. Refresh and try again."
          : "Could not update ticket status."),
    );
  }
}
