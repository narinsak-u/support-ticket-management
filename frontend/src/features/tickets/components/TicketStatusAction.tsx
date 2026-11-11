import { useMutation } from "@tanstack/react-query";
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
  const nextStatus =
    status === "OPEN"
      ? "IN_PROGRESS"
      : status === "IN_PROGRESS"
        ? "RESOLVED"
        : null;
  const mutation = useMutation({
    mutationFn: (nextStatus: Ticket["status"]) =>
      updateTicketStatus(ticketId, nextStatus),
    onSuccess: onChanged,
  });

  if (!nextStatus) return null;

  function updateStatus() {
    mutation.mutate(nextStatus);
  }

  return (
    <div>
      <button
        className="secondary-button"
        type="button"
        disabled={mutation.isPending}
        onClick={updateStatus}
      >
        {mutation.isPending
          ? "Updating…"
          : `Mark as ${nextStatus.replace("_", " ").toLowerCase()}`}
      </button>
      {mutation.error && (
        <p className="request-error" role="alert">
          {mutation.error instanceof Error
            ? mutation.error.message
            : "Could not update ticket status. Try again."}
        </p>
      )}
    </div>
  );
}
