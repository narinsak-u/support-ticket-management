import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { createTicket } from "../api/tickets";
import { ticketSchema, type TicketInput } from "../types";

export function CreateTicketForm({
  onCreated,
}: {
  onCreated: () => Promise<void>;
}) {
  const mutation = useMutation({
    mutationFn: createTicket,
    onSuccess: onCreated,
  });
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<TicketInput>({
    resolver: zodResolver(ticketSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "GENERAL",
      priority: "MEDIUM",
    },
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
            <div>
              <dt>Ticket ID</dt>
              <dd>{mutation.data.id}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>
                <span className="status-pill">{mutation.data.status}</span>
              </dd>
            </div>
            <div>
              <dt>Assigned Team</dt>
              <dd>{mutation.data.assignedTeamCode}</dd>
            </div>
          </dl>
          <button
            className="secondary-button"
            type="button"
            onClick={() => mutation.reset()}
          >
            Create another ticket
          </button>
        </div>
      ) : (
        <form className="ticket-form" onSubmit={submit} noValidate>
          <div className="field">
            <label htmlFor="title">Title</label>
            <input
              id="title"
              aria-invalid={Boolean(errors.title)}
              aria-describedby={errors.title ? "title-error" : "title-hint"}
              {...register("title")}
            />
            <div className="field-foot">
              <span id="title-hint">
                Summarize your request in a few words.
              </span>
              {errors.title && (
                <span className="field-error" id="title-error">
                  {errors.title.message}
                </span>
              )}
            </div>
          </div>
          <div className="field">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              rows={5}
              aria-invalid={Boolean(errors.description)}
              aria-describedby={
                errors.description ? "description-error" : undefined
              }
              {...register("description")}
            />
            {errors.description && (
              <span className="field-error" id="description-error">
                {errors.description.message}
              </span>
            )}
          </div>
          <div className="choice-grid">
            <div className="field">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                aria-invalid={Boolean(errors.category)}
                aria-describedby={
                  errors.category ? "category-error" : undefined
                }
                {...register("category")}
              >
                <option value="TECHNICAL">Technical</option>
                <option value="BILLING">Billing</option>
                <option value="GENERAL">General</option>
              </select>
              {errors.category && (
                <span className="field-error" id="category-error">
                  {errors.category.message}
                </span>
              )}
            </div>
            <div className="field">
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                aria-invalid={Boolean(errors.priority)}
                aria-describedby={
                  errors.priority ? "priority-error" : undefined
                }
                {...register("priority")}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
              {errors.priority && (
                <span className="field-error" id="priority-error">
                  {errors.priority.message}
                </span>
              )}
            </div>
          </div>
          {mutation.isError && (
            <p className="request-error" role="alert">
              {mutation.error.message}
            </p>
          )}
          <button
            className="submit-button"
            type="submit"
            disabled={mutation.isPending}
          >
            {mutation.isPending ? (
              <>
                <span className="spinner" aria-hidden="true" />
                Creating ticket…
              </>
            ) : (
              "Create ticket"
            )}
          </button>
          <p className="form-footnote">
            A Team is assigned as soon as your ticket is created.
          </p>
        </form>
      )}
    </section>
  );
}
