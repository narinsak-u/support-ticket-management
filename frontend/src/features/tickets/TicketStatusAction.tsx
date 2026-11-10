import { useState } from 'react';

type TicketStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';

type TicketStatusActionProps = {
  ticketId: string;
  status: TicketStatus;
  onChanged: () => void;
};

export function TicketStatusAction({ ticketId, status, onChanged }: TicketStatusActionProps) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const nextStatus = status === 'OPEN' ? 'IN_PROGRESS' : status === 'IN_PROGRESS' ? 'RESOLVED' : null;

  if (!nextStatus) return null;

  async function updateStatus() {
    setPending(true);
    setError(null);
    try {
      const response = await fetch(`/api/v1/tickets/${encodeURIComponent(ticketId)}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: nextStatus }),
      });
      if (!response.ok) {
        if (response.status >= 500) throw new Error('Could not update ticket status. Try again.');
        const body = await response.json().catch(() => null) as { message?: string | string[] } | null;
        const message = Array.isArray(body?.message) ? body.message.join(' ') : body?.message;
        throw new Error(message || (response.status === 409
          ? 'Ticket status changed elsewhere. Refresh and try again.'
          : 'Could not update ticket status.'));
      }
      onChanged();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not update ticket status. Try again.');
    } finally {
      setPending(false);
    }
  }

  return (
    <div>
      <button className="secondary-button" type="button" disabled={pending} onClick={updateStatus}>
        {pending ? 'Updating…' : `Mark as ${nextStatus.replace('_', ' ').toLowerCase()}`}
      </button>
      {error && <p className="request-error" role="alert">{error}</p>}
    </div>
  );
}
