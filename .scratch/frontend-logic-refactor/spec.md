Status: ready-for-agent

# Frontend Ticket Logic Refactor

## Problem Statement

Ticket browsing combines filter and pagination state, list and detail queries, invalid-page correction, selection coordination, and cache invalidation in one component. Status updates also manage mutation loading and error state manually, despite the frontend already using TanStack Query mutations elsewhere. These responsibilities make behavior harder to follow and evolve.

## Solution

Move ticket-browser data coordination into a feature hook and use TanStack Query mutation state for ticket status updates. Keep UI components focused on rendering and user events. Preserve current browser behavior and the controlled ticket selection contract shared with the notification panel.

## User Stories

1. As a support agent, I want to browse a paginated support-ticket list, so that I can review the queue without loading every record at once.
2. As a support agent, I want to filter the queue by category and status, so that I can focus on relevant support tickets.
3. As a support agent, I want the current page to reset when I change a filter, so that I see results matching the new filter immediately.
4. As a support agent, I want selecting a support ticket to show its details, so that I can inspect its description, category, priority, Team, and creation time.
5. As a support agent, I want a ticket selected from a Notification record to remain selectable in the browser, so that both parts of the dashboard coordinate around the same support ticket.
6. As a support agent, I want the first ticket on the current page to appear in the detail panel when no ticket is explicitly selected, so that the panel remains useful after filtering or changing pages.
7. As a support agent, I want the browser to correct an out-of-range page after the result count changes, so that the ticket list does not remain on an empty invalid page.
8. As a support agent, I want allowed status actions to show pending and error feedback, so that I understand whether a requested transition succeeded.
9. As a support agent, I want successful status changes to refresh the affected ticket details and queue results, so that the dashboard reflects the persisted lifecycle state.
10. As a developer, I want browser state and query coordination separated from ticket-browser rendering, so that each responsibility can be maintained without changing the user workflow.
11. As a developer, I want status-update pending and error state managed through the frontend's existing mutation pattern, so that the operation follows the same server-state conventions as ticket creation.

## Implementation Decisions

- Add a hook within the Tickets feature to coordinate category and status filters, page state, ticket-list and ticket-detail queries, active-ticket selection, page correction, and status-update cache invalidation.
- Keep ticket selection controlled by the application so the Notification panel can select a support ticket. The hook accepts the selected ID and selection callback; it does not introduce a second selection store.
- Keep `TicketBrowser` and its child components responsible for presentation. The hook exposes the values and actions required by those components rather than returning UI markup.
- Manage status-update pending and error state with TanStack Query's existing mutation API. Preserve the allowed transitions and current user-facing feedback.
- Do not introduce shared status/date-format helpers, a notification hook, a new state library, or a frontend test dependency for this refactor.
- No API, database, or domain lifecycle changes.

## Testing Decisions

- A good test verifies observable browser behavior, not hook internals, query keys, component composition, or implementation-specific state.
- Use the agreed browser smoke seam against the running full-stack application. Verify ticket selection and detail display; category/status filtering resets pagination; page changes show the expected ticket; and status updates show pending/error feedback and refresh the list and details after success.
- Reuse the existing support-ticket Compose setup and browser workflow. The existing integration smoke script exercises API behavior but does not assert frontend interactions; there is no frontend test runner or browser automation suite.
- Do not add a persistent test framework or dependency for this refactor.

## Out of Scope

- Changes to support-ticket behavior, API contracts, routing, persistence, or notification behavior.
- Refactoring ticket creation form state or notification fetching.
- Extracting display-formatting helpers for status labels or dates.
- Adding a frontend test framework or permanent browser automation suite.
- New filters, sorting, query caching policy, or UX changes.

## Further Notes

- Use the glossary terms “support ticket,” “Team,” and “Notification record.”
- Preserve current loading, empty, and error states, pagination defaults, and selection behavior.
- The approved validation seam is a browser smoke check against the running app, without a new testing dependency.
