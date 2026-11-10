# 01: Start app and pass health check

**What to build:** A developer can start the support-ticket app locally, load its frontend shell, and verify that the backend is ready.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Docker Compose starts the frontend, backend, PostgreSQL, and migration service on a clean environment.
- [ ] The migration service completes successfully and PostgreSQL data persists across container recreation.
- [ ] The frontend loads and the backend health endpoint returns 200 only when the backend is ready to serve requests.
- [ ] A narrow automated check verifies the health behavior and Compose startup prerequisites.
