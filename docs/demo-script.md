# Technical Demo Script (12 minutes)

## Before the demo

Requirements: Docker Compose, `curl`, and `jq`; no local Node.js or PostgreSQL needed. Start from the repository root. Compose publishes the UI and API only on loopback. The default database password is disposable-demo-only.

Start the four services and check health:

```sh
docker compose up --build -d
docker compose ps --all
curl -fsS http://localhost:3000/health
```

Open <http://localhost:5173>. The services are `db`, `migrate` (runs and exits), `backend`, and `frontend`. The frontend calls the backend directly at its configured `VITE_API_URL`; CORS allows its origin. Direct API commands below use port 3000.

## Walkthrough

### 0:00–2:00 — Scope and boundaries

Describe this as a single-process NestJS Modular Monolith with Ticket, Routing, and Notification business modules. Show `docs/architecture.md` and its dependency diagram. Explain that there is no internal HTTP between modules: Ticket calls typed Routing and Notification capabilities. Routing owns deterministic team selection; Ticket owns lifecycle and status rules; Notification owns notification records. PostgreSQL adapters implement repository ports.

### 2:00–4:00 — Create and route a ticket

Create a ticket with the UI or use this reproducible API sequence. `TICKET_ID` is a shell variable populated from the actual create response; it is not a sample or fixed ID.

```sh
response=$(curl -fsS http://localhost:3000/api/v1/tickets \
  -H 'Content-Type: application/json' \
  -d '{"title":"Demo: sign-in failure","description":"Cannot access account","category":"TECHNICAL","priority":"HIGH"}')
printf '%s\n' "$response" | jq .
TICKET_ID=$(printf '%s\n' "$response" | jq -er '.id')
printf 'Ticket ID: %s\n' "$TICKET_ID"
```

The response should report `OPEN` and `ENGINEERING_TEAM` for TECHNICAL/HIGH. If created through the UI, its list and notification panel refresh after creation.

### 4:00–6:00 — List, detail, notification

Show the ticket in the UI list, select it, and point out its detail fields and assigned team. Show its notification record in the activity panel. These commands inspect the same records:

```sh
curl -fsS 'http://localhost:3000/api/v1/tickets?category=TECHNICAL&status=OPEN&page=1&limit=20' | jq .
curl -fsS "http://localhost:3000/api/v1/tickets/$TICKET_ID" | jq .
curl -fsS http://localhost:3000/api/v1/notifications | jq .
```

### 6:00–8:00 — Allowed and rejected transitions

Advance `OPEN` to `IN_PROGRESS`, then `RESOLVED`. Attempt the forbidden reopen; this final request is expected to return HTTP 409 with `INVALID_STATUS_TRANSITION`.

```sh
curl -i -X PATCH "http://localhost:3000/api/v1/tickets/$TICKET_ID/status" \
  -H 'Content-Type: application/json' -d '{"status":"IN_PROGRESS"}'
curl -i -X PATCH "http://localhost:3000/api/v1/tickets/$TICKET_ID/status" \
  -H 'Content-Type: application/json' -d '{"status":"RESOLVED"}'
curl -i -X PATCH "http://localhost:3000/api/v1/tickets/$TICKET_ID/status" \
  -H 'Content-Type: application/json' -d '{"status":"OPEN"}'
```

The UI exposes only the next allowed action and no action after `RESOLVED`; the API check demonstrates the domain rule independently of that UI. Refresh the list/detail to show the final state.

### 8:00–9:00 — API documentation

Open <http://localhost:3000/api/docs>. Show ticket creation/list/detail, status, and notifications operations. The JSON contract is at <http://localhost:3000/api/docs-json>.

### 9:00–10:30 — Test seam and boundaries

Open `backend/src/modules/ticket/application/create-ticket.ts`. Point out its `TicketRepository`, `RoutingCapability`, and `NotificationCapability` constructor dependencies; the use case can be tested with fakes without starting NestJS or PostgreSQL. Open `backend/src/modules/ticket/application/create-ticket.spec.ts` to show that seam. Run that focused test in Docker without host Node.js:

```sh
docker build --target build -f backend/Dockerfile -t support-ticket-tests .
docker run --rm support-ticket-tests npm test -- src/modules/ticket/application/create-ticket.spec.ts
```

### 10:30–12:00 — AI trade-off and limitations

Use one evidenced trade-off: the implementation composes notification recording synchronously after ticket persistence instead of adding a message broker. A notification failure is logged and does not undo the saved ticket; delivery is not durable or guaranteed. Explain that this keeps the PoC small but is not a production delivery guarantee.

Limitations: no authentication or RBAC, no actual email/SMS/push delivery, and no public-deployment security claim. Compose binds ports to loopback; public deployment requires security controls and production secrets. See `docs/decisions.md` for recorded architecture decisions.

## Observed evidence

The recorded `bash scripts/integration-smoke.sh` run passed on an isolated fresh PostgreSQL volume. It checked migration, ticket/notification persistence, OPEN→IN_PROGRESS→RESOLVED persistence, filtered listing, invalid reopen (409), and `limit=101` (400); it cleaned its disposable volume.

In the recorded API check, a TECHNICAL/HIGH ticket was assigned `ENGINEERING_TEAM`; status changes returned 200, an invalid reopen returned 409, and malformed/missing-ticket requests returned 400/404. The recorded browser walkthrough showed list/detail updates and an out-of-band stale status action displaying a 409 alert. These are prior observed results, not promises that another environment or future run will produce them.
