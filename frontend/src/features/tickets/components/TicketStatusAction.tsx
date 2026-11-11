import { useState } from "react";
import { updateTicketStatus } from "../api/tickets";
import type { Ticket } from "../types";

type TicketStatusActionProps = {
  ticketId: string;
  status: Ticket["status"];
  onChanged: () => void;
};

export function TicketStatusAction({
  ticketId,
  status,
  onChanged,
}: TicketStatusActionProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nextStatus =
    status === "OPEN"
      ? "IN_PROGRESS"
      : status === "IN_PROGRESS"
        ? "RESOLVED"
        : null;

  if (!nextStatus) return null;

  async function updateStatus() {
    setPending(true);
    setError(null);
    try {
      await updateTicketStatus(ticketId, nextStatus!);
      onChanged();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not update ticket status. Try again.",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <button
        className="secondary-button"
        type="button"
        disabled={pending}
        onClick={updateStatus}
      >
        {pending
          ? "Updating…"
          : `Mark as ${nextStatus.replace("_", " ").toLowerCase()}`}
      </button>
      {error && (
        <p className="request-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
