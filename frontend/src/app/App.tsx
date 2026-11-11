import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { CreateTicketForm } from "../features/tickets/components/CreateTicketForm";
import { TicketBrowser } from "../features/tickets/components/TicketBrowser";
import { NotificationPanel } from "../features/notifications/components/NotificationPanel";

export function App() {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  return (
    <main className="workspace">
      <header className="topbar">
        <a className="brand" href="/" aria-label="support-ticket home">
          <span className="brand-mark" aria-hidden="true">
            S
          </span>
          <span>support-ticket</span>
        </a>
        <span className="workspace-label">Ticket workspace</span>
      </header>

      <div className="page-layout">
        <section className="intro" aria-labelledby="page-title">
          <p className="eyebrow">Support operations</p>
          <h1 id="page-title">
            Requests,
            <br />
            in good hands.
          </h1>
          <p className="intro-copy">
            Track saved requests, see who owns them, and send a new issue to the
            right team.
          </p>
          <div className="routing-note">
            <span className="routing-dot" aria-hidden="true" />
            <p>
              <strong>Automatic routing</strong>
              <br />
              Category and priority determine the assigned Team.
            </p>
          </div>
        </section>

        <CreateTicketForm
          onCreated={async () => {
            await Promise.all([
              queryClient.invalidateQueries({ queryKey: ["tickets"] }),
              queryClient.invalidateQueries({ queryKey: ["notifications"] }),
            ]);
          }}
        />
        <TicketBrowser selectedId={selectedId} onSelectTicket={setSelectedId} />
        <NotificationPanel onSelectTicket={setSelectedId} />
      </div>
      <footer className="page-footer">
        <span>support-ticket</span>
        <span>Requests, routed with care.</span>
      </footer>
    </main>
  );
}
