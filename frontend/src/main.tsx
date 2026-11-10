import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider, useMutation } from '@tanstack/react-query';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import './style.css';

const ticketSchema = z.object({
  title: z.string().trim().min(1, 'Enter a title.').max(150, 'Title must be 150 characters or fewer.'),
  description: z.string().trim().max(2000, 'Description must be 2,000 characters or fewer.'),
  category: z.enum(['TECHNICAL', 'BILLING', 'GENERAL'], { message: 'Choose a category.' }),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'], { message: 'Choose a priority.' }),
});

type TicketInput = z.infer<typeof ticketSchema>;
type Ticket = TicketInput & {
  id: string;
  status: 'OPEN';
  assignedTeamCode: string;
  createdAt: string;
};

async function createTicket(input: TicketInput): Promise<Ticket> {
  const response = await fetch('/api/v1/tickets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null);
    const message = typeof body === 'object' && body !== null && 'message' in body
      ? body.message
      : null;
    throw new Error(Array.isArray(message) ? message.join(' ') : typeof message === 'string' ? message : 'Ticket could not be created. Try again.');
  }
  return response.json() as Promise<Ticket>;
}

function App() {
  const mutation = useMutation({ mutationFn: createTicket });
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
          <h1 id="page-title">Tell us what<br />needs attention.</h1>
          <p className="intro-copy">Share the details and we’ll send your request to the right team.</p>
          <div className="routing-note">
            <span className="routing-dot" aria-hidden="true" />
            <p><strong>Automatic routing</strong><br />Your category and priority decide who picks this up.</p>
          </div>
        </section>

        <section className="form-panel" aria-labelledby="form-title">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">New request</p>
              <h2 id="form-title">Create a ticket</h2>
            </div>
          </div>

          {mutation.data ? (
            <div className="success-panel" role="status" aria-live="polite">
              <p className="success-kicker">Ticket created</p>
              <h3>Your request is in the queue.</h3>
              <dl className="ticket-summary">
                <div><dt>Ticket ID</dt><dd>{mutation.data.id}</dd></div>
                <div><dt>Status</dt><dd><span className="status-pill">{mutation.data.status}</span></dd></div>
                <div><dt>Assigned team</dt><dd>{mutation.data.assignedTeamCode}</dd></div>
              </dl>
              <button className="secondary-button" type="button" onClick={() => mutation.reset()}>Create another ticket</button>
            </div>
          ) : (
            <form className="ticket-form" onSubmit={submit} noValidate>
              <div className="field">
                <label htmlFor="title">Title</label>
                <input id="title" maxLength={150} aria-invalid={Boolean(errors.title)} aria-describedby={errors.title ? 'title-error' : 'title-hint'} {...register('title')} />
                <div className="field-foot">
                  <span id="title-hint">Summarize your request in a few words.</span>
                  {errors.title && <span className="field-error" id="title-error">{errors.title.message}</span>}
                </div>
              </div>

              <div className="field">
                <label htmlFor="description">Description</label>
                <textarea id="description" rows={5} maxLength={2000} aria-invalid={Boolean(errors.description)} aria-describedby={errors.description ? 'description-error' : undefined} {...register('description')} />
                {errors.description && <span className="field-error" id="description-error">{errors.description.message}</span>}
              </div>

              <div className="choice-grid">
                <div className="field">
                  <label htmlFor="category">Category</label>
                  <select id="category" aria-invalid={Boolean(errors.category)} aria-describedby={errors.category ? 'category-error' : undefined} {...register('category')}>
                    <option value="TECHNICAL">Technical</option>
                    <option value="BILLING">Billing</option>
                    <option value="GENERAL">General</option>
                  </select>
                  {errors.category && <span className="field-error" id="category-error">{errors.category.message}</span>}
                </div>
                <div className="field">
                  <label htmlFor="priority">Priority</label>
                  <select id="priority" aria-invalid={Boolean(errors.priority)} aria-describedby={errors.priority ? 'priority-error' : undefined} {...register('priority')}>
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="CRITICAL">Critical</option>
                  </select>
                  {errors.priority && <span className="field-error" id="priority-error">{errors.priority.message}</span>}
                </div>
              </div>

              {mutation.isError && <p className="request-error" role="alert">{mutation.error.message}</p>}
              <button className="submit-button" type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? <><span className="spinner" aria-hidden="true" />Creating ticket…</> : 'Create ticket'}
              </button>
              <p className="form-footnote">A team will be assigned as soon as your ticket is created.</p>
            </form>
          )}
        </section>
      </div>
      <footer className="page-footer"><span>support-ticket</span><span>Requests, routed with care.</span></footer>
    </main>
  );
}

const queryClient = new QueryClient();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);
