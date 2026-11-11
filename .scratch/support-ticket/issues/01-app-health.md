# 01: Start app and pass health check

**What to build:** A developer can start the support-ticket app locally, load its frontend shell, and verify that the backend is ready.

**Blocked by:** None (can start immediately)

**Status:** resolved

- [x] Docker Compose starts the frontend, backend, PostgreSQL, and migration service on a clean environment.
- [x] The migration service completes successfully and PostgreSQL data persists across container recreation.
- [x] The frontend loads and the backend health endpoint returns 200 only when the backend is ready to serve requests.
- [x] A narrow automated check verifies the health behavior and Compose startup prerequisites.

## Answer

Compose builds and starts all four services; migration exits successfully and the backend reaches healthy state. The health test, browser load, and fresh-database integration smoke verify readiness and persisted PostgreSQL data.
