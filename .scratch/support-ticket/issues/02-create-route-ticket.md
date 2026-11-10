# 02: Create and route a support ticket

**What to build:** A user submits a support ticket in the UI, sees its assigned Team, and can rely on it being saved even if notification recording fails.

**Blocked by:** 01: Start app and pass health check

**Status:** ready-for-agent

- [ ] The UI submits title, description, category, and priority; invalid title, description, category, or priority receives a clear error.
- [ ] The backend creates tickets as OPEN and assigns a Team using the documented Routing precedence: CRITICAL always selects INCIDENT_TEAM; otherwise category selects the Team.
- [ ] The support ticket and a notification record persist in PostgreSQL; notification recording happens after ticket persistence.
- [ ] A notification-recording failure is logged and does not undo a successfully persisted ticket.
- [ ] A browser workflow proves ticket creation and Team assignment; focused tests cover validation, Routing rules, and notification failure behavior.
