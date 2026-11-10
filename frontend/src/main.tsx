import { StrictMode, useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { TicketStatusAction } from './features/tickets/TicketStatusAction';
import { NotificationPanel } from './features/notifications/NotificationPanel';
import './style.css';

function withinCharacterLimit(value: string, max: number): boolean {
  if (value.length <= max) return true;
  let count = 0;
  for (let offset = 0; offset < value.length;) {
    if (++count > max) return false;
    offset += value.codePointAt(offset)! > 0xffff ? 2 : 1;
  }
  return true;
}

const ticketSchema = z.object({
  title: z.string().trim().min(1, 'Enter a title.').refine((value) => withinCharacterLimit(value, 150), { message: 'Title must be 150 characters or fewer.' }),
  description: z.string().trim().refine((value) => withinCharacterLimit(value, 2000), { message: 'Description must be 2,000 characters or fewer.' }),
  category: z.enum(['TECHNICAL', 'BILLING', 'GENERAL'], { message: 'Choose a category.' }),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], { message: 'Choose a priority.' }),
});

type TicketInput = z.infer<typeof ticketSchema>;
type Ticket = TicketInput & {
  id: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  assignedTeamCode: string;
  createdAt: string;
};

async function requestJson<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) throw new Error('Could not load tickets. Try again.');
  return response.json() as Promise<T>;
}

async function createTicket(input: TicketInput): Promise<Ticket> {
  const response = await fetch('/api/v1/tickets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    const error = typeof body === 'object' && body !== null && 'error' in body ? body.error : null;
    const message = typeof error === 'object' && error !== null && 'message' in error ? error.message : null;
    const fallback = 'Ticket could not be created. Try again.';
    const safeMessage = response.status < 500
      ? Array.isArray(message) && message.every((part): part is string => typeof part === 'string')
        ? message.join(' ')
        : typeof message === 'string' ? message : fallback
      : fallback;
    throw new Error(safeMessage);
  }
  return response.json() as Promise<Ticket>;
}


function App() {
  const queryClient = useQueryClient();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const limit = 20;
  const ticketQuery = useQuery({
    queryKey: ['tickets', { category, status, page, limit }],
    queryFn: () => requestJson<{ data: Ticket[]; pagination: { page: number; limit: number; total: number } }>(
      `/api/v1/tickets?category=${category}&status=${status}&page=${page}&limit=${limit}`,
    ),
    retry: false,
  });
  useEffect(() => {
    const total = ticketQuery.data?.pagination.total;
    if (total === undefined) return;
    const lastPage = Math.max(1, Math.ceil(total / limit));
    if (page > lastPage) {
      setPage(lastPage);
      setSelectedId(null);
    }
  }, [ticketQuery.data?.pagination.total, page, limit]);
  const tickets = ticketQuery.data?.data ?? [];
  const activeId = selectedId ?? tickets[0]?.id ?? null;
  const detailQuery = useQuery({
    queryKey: ['ticket', activeId],
    queryFn: () => requestJson<Ticket>(`/api/v1/tickets/${activeId}`),
    enabled: activeId !== null,
    retry: false,
  });
  const mutation = useMutation({
    mutationFn: createTicket,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['tickets'] }),
        queryClient.invalidateQueries({ queryKey: ['notifications'] }),
      ]);
    },
  });
  const { register, handleSubmit, reset, formState: { errors } } = useForm<TicketInput>({
    resolver: zodResolver(ticketSchema),
    defaultValues: { title: '', description: '', category: 'GENERAL', priority: 'MEDIUM' },
  });

  const submit = handleSubmit(async (input) => {
    try {
      await mutation.mutateAsync(input);
      reset();
    } catch {
      // The mutation error is announced below; keep entered values for retry.
    }
  });

  return (
    <main className="workspace">
      <header className="topbar">
        <a className="brand" href="/" aria-label="support-ticket home">
          <span className="brand-mark" aria-hidden="true">S</span>
          <span>support-ticket</span>
        </a>
        <span className="workspace-label">Ticket workspace</span>
      </header>

      <div className="page-layout">
        <section className="intro" aria-labelledby="page-title">
          <p className="eyebrow">Support operations</p>
          <h1 id="page-title">Requests,<br />in good hands.</h1>
          <p className="intro-copy">Track saved requests, see who owns them, and send a new issue to the right team.</p>
          <div className="routing-note">
            <span className="routing-dot" aria-hidden="true" />
            <p><strong>Automatic routing</strong><br />Category and priority determine the assigned Team.</p>
          </div>
        </section>

        <section className="form-panel" aria-labelledby="form-title">
          <div className="panel-heading">
            <div><p className="eyebrow">New request</p><h2 id="form-title">Create a ticket</h2></div>
          </div>
          {mutation.data ? (
            <div className="success-panel" role="status" aria-live="polite">
              <p className="success-kicker">Ticket created</p>
              <h3>Your request is in the queue.</h3>
              <dl className="ticket-summary">
                <div><dt>Ticket ID</dt><dd>{mutation.data.id}</dd></div>
                <div><dt>Status</dt><dd><span className="status-pill">{mutation.data.status}</span></dd></div>
                <div><dt>Assigned Team</dt><dd>{mutation.data.assignedTeamCode}</dd></div>
              </dl>
              <button className="secondary-button" type="button" onClick={() => mutation.reset()}>Create another ticket</button>
            </div>
          ) : (
            <form className="ticket-form" onSubmit={submit} noValidate>
              <div className="field">
                <label htmlFor="title">Title</label>
                <input id="title" aria-invalid={Boolean(errors.title)} aria-describedby={errors.title ? 'title-error' : 'title-hint'} {...register('title')} />
                <div className="field-foot"><span id="title-hint">Summarize your request in a few words.</span>{errors.title && <span className="field-error" id="title-error">{errors.title.message}</span>}</div>
              </div>
              <div className="field">
                <label htmlFor="description">Description</label>
                <textarea id="description" rows={5} aria-invalid={Boolean(errors.description)} aria-describedby={errors.description ? 'description-error' : undefined} {...register('description')} />
                {errors.description && <span className="field-error" id="description-error">{errors.description.message}</span>}
              </div>
              <div className="choice-grid">
                <div className="field">
                  <label htmlFor="category">Category</label>
                  <select id="category" aria-invalid={Boolean(errors.category)} aria-describedby={errors.category ? 'category-error' : undefined} {...register('category')}>
                    <option value="TECHNICAL">Technical</option><option value="BILLING">Billing</option><option value="GENERAL">General</option>
                  </select>
                  {errors.category && <span className="field-error" id="category-error">{errors.category.message}</span>}
                </div>
                <div className="field">
                  <label htmlFor="priority">Priority</label>
                  <select id="priority" aria-invalid={Boolean(errors.priority)} aria-describedby={errors.priority ? 'priority-error' : undefined} {...register('priority')}>
                    <option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option><option value="CRITICAL">Critical</option>
                  </select>
                  {errors.priority && <span className="field-error" id="priority-error">{errors.priority.message}</span>}
                </div>
              </div>
              {mutation.isError && <p className="request-error" role="alert">{mutation.error.message}</p>}
              <button className="submit-button" type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? <><span className="spinner" aria-hidden="true" />Creating ticket…</> : 'Create ticket'}
              </button>
              <p className="form-footnote">A Team is assigned as soon as your ticket is created.</p>
            </form>
          )}
        </section>

        <section className="browse-section" aria-labelledby="tickets-title">
          <div className="section-heading"><div><p className="eyebrow">Your queue</p><h2 id="tickets-title">Support tickets</h2></div><span className="record-count">{ticketQuery.data?.pagination.total ?? 0} total</span></div>
          <div className="ticket-controls">
            <div className="filter-fields">
              <label>Category
                <select value={category} onChange={(event) => { setCategory(event.target.value); setPage(1); setSelectedId(null); }}>
                  <option value="">All categories</option><option value="TECHNICAL">Technical</option><option value="BILLING">Billing</option><option value="GENERAL">General</option>
                </select>
              </label>
              <label>Status
                <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); setSelectedId(null); }}>
                  <option value="">All statuses</option><option value="OPEN">Open</option><option value="IN_PROGRESS">In progress</option><option value="RESOLVED">Resolved</option>
                </select>
              </label>
            </div>
            <p className="page-count" aria-live="polite">
              {ticketQuery.data?.pagination.total ? `Showing ${(page - 1) * limit + 1}–${Math.min(page * limit, ticketQuery.data.pagination.total)} of ${ticketQuery.data.pagination.total}` : 'Showing 0 of 0'}
            </p>
          </div>
          <div className="browse-grid">
            <div className="ticket-list" aria-label="Support tickets">
              {ticketQuery.isLoading ? <p className="state-message" role="status">Loading tickets…</p>
                : ticketQuery.isError ? <p className="state-message error-state" role="alert">{ticketQuery.error.message}</p>
                  : tickets.length === 0 ? <p className="state-message">No tickets yet. Create a ticket to start your queue.</p>
                    : tickets.map((ticket) => (
                      <button className={`ticket-row${activeId === ticket.id ? ' is-selected' : ''}`} type="button" key={ticket.id} onClick={() => setSelectedId(ticket.id)} aria-current={activeId === ticket.id ? 'true' : undefined}>
                        <span className="ticket-row-title">{ticket.title}</span>
                        <span className="ticket-row-meta"><span className={`status-label status-${ticket.status.toLowerCase()}`}>{ticket.status.replace('_', ' ')}</span><span>{ticket.priority}</span><span>{ticket.assignedTeamCode}</span></span>
                      </button>
                    ))}
            </div>
            <nav className="pagination-controls" aria-label="Ticket pages">
              <button type="button" onClick={() => { setPage((current) => current - 1); setSelectedId(null); }} disabled={page <= 1 || ticketQuery.isFetching}>Previous</button>
              <span>Page {page} of {Math.max(1, Math.ceil((ticketQuery.data?.pagination.total ?? 0) / limit))}</span>
              <button type="button" onClick={() => { setPage((current) => current + 1); setSelectedId(null); }} disabled={page * limit >= (ticketQuery.data?.pagination.total ?? 0) || ticketQuery.isFetching}>Next</button>
            </nav>
            <section className="detail-panel" aria-labelledby="detail-title" aria-live="polite">
              <h3 className="visually-hidden" id="detail-title">Ticket details</h3>
              {!activeId ? <p className="state-message">Select a ticket to see its details.</p>
                : detailQuery.isLoading ? <p className="state-message" role="status">Loading ticket details…</p>
                  : detailQuery.isError ? <p className="state-message error-state" role="alert">{detailQuery.error.message}</p>
                    : detailQuery.data ? <>
                      <div className="detail-heading"><div><p className="detail-label">Ticket details</p><h3>{detailQuery.data.title}</h3></div><span className={`status-label status-${detailQuery.data.status.toLowerCase()}`}>{detailQuery.data.status.replace('_', ' ')}</span></div>
                      <p className="detail-description">{detailQuery.data.description || 'No description provided.'}</p>
                      <dl className="detail-facts">
                        <div><dt>Category</dt><dd>{detailQuery.data.category}</dd></div>
                        <div><dt>Priority</dt><dd>{detailQuery.data.priority}</dd></div>
                        <div><dt>Assigned Team</dt><dd>{detailQuery.data.assignedTeamCode}</dd></div>
                        <div><dt>Created</dt><dd>{new Date(detailQuery.data.createdAt).toLocaleString()}</dd></div>
                      </dl>
                      <TicketStatusAction key={detailQuery.data.id} ticketId={detailQuery.data.id} status={detailQuery.data.status} onChanged={() => {
                        queryClient.invalidateQueries({ queryKey: ['tickets'] });
                        queryClient.invalidateQueries({ queryKey: ['ticket', detailQuery.data.id] });
                      }} />
                    </> : null}
            </section>
          </div>
        </section>

        <NotificationPanel onSelectTicket={setSelectedId} />
      </div>
      <footer className="page-footer"><span>support-ticket</span><span>Requests, routed with care.</span></footer>
    </main>
  );
}

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode><QueryClientProvider client={queryClient}><App /></QueryClientProvider></StrictMode>,
);
