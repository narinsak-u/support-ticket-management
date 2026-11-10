# support-ticket

A locally run support-ticket proof of concept: React dashboard, NestJS modular monolith, and PostgreSQL. Docker Compose builds and starts the app; local Node.js, npm, and PostgreSQL are not required for app startup.

## Start

Requirements: Docker Engine with the Compose plugin.

```sh
docker compose up --build -d
```

Compose starts four services: `db`, `migrate`, `backend`, and `frontend`. The migration service applies pending Drizzle migrations before the backend starts. PostgreSQL data lives in the named `postgres_data` volume and survives container recreation.

- Dashboard: <http://localhost:8080>
- API: <http://localhost:3000/api/v1>
- Swagger UI: <http://localhost:3000/api/docs>
- OpenAPI JSON: <http://localhost:3000/api/docs-json>
- Health: <http://localhost:3000/health>

Both published ports bind to `127.0.0.1`. This unauthenticated demo is not safe for public exposure.

Example: create a ticket through the API.

```sh
curl -X POST http://localhost:3000/api/v1/tickets \
  -H 'content-type: application/json' \
  -d '{"title":"Cannot sign in","description":"Login fails","category":"TECHNICAL","priority":"HIGH"}'
```

## Stop

```sh
docker compose down
```

This stops and removes containers and networks. It keeps `postgres_data`. To remove the database and permanently erase its stored tickets and notification records:

```sh
docker compose down --volumes
```

**Warning:** `--volumes` permanently deletes the Compose database volume and all data in it.

## Tests

Tests are optional for running the Docker application. Host-side backend tests need Node.js/npm and install backend dependencies:

```sh
cd backend && npm ci && npm test
```

The fresh-database integration smoke script needs Docker, not host Node.js/PostgreSQL:

```sh
bash scripts/integration-smoke.sh
```

## Boundaries and limitations

See [architecture](docs/architecture.md) for module responsibilities, contracts, and manual boundary inspection; [decisions](docs/decisions.md) for the six ADRs; [demo walkthrough](docs/demo-script.md); and [AI development log](docs/ai-development-log.md).

This is a proof of concept, not a production service. It has no authentication or authorization, sends no email/SMS/push messages, and does not guarantee durable notification delivery. A crash after ticket commit can leave no notification record. See [architecture decisions](docs/decisions.md#adr-006-no-authentication-in-mvp).
