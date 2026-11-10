Status: resolved

# Support Ticket MVP

## Problem Statement

The repository contains an approved architecture specification for a support-ticket application, but no application implementation. Users need a working, locally runnable application that demonstrates the ticket lifecycle, automatic team assignment, notification records, and the specified modular architecture. The system must be understandable and testable without adding production-scale infrastructure.

## Solution

Build the `support-ticket` proof of concept described in `docs/spec.md`: a React web app backed by a NestJS modular monolith and PostgreSQL. A user can create, find, and update support tickets; Routing assigns a team; Notification records ticket creation without sending messages. Provide Swagger/OpenAPI documentation, tests, and Docker Compose startup.

## User Stories

1. As an app user, I want to create a support ticket with a title, description, category, and priority, so that my request enters the support workflow.
2. As an app user, I want the system to reject an empty title, so that every support ticket can be identified.
3. As an app user, I want the system to reject a title longer than 150 characters, so that ticket titles stay within the supported limit.
4. As an app user, I want the system to reject a description longer than 2,000 characters, so that ticket data meets the documented constraints.
5. As an app user, I want to choose only TECHNICAL, BILLING, or GENERAL categories, so that Routing can classify my request consistently.
6. As an app user, I want to choose only LOW, MEDIUM, HIGH, or CRITICAL priority, so that the system can route urgent work correctly.
7. As an app user, I want the backend to set new tickets to OPEN, so that clients cannot choose an invalid initial status.
8. As an app user, I want Routing to assign CRITICAL tickets to INCIDENT_TEAM regardless of category, so that urgent incidents reach the incident team.
9. As an app user, I want TECHNICAL tickets to go to ENGINEERING_TEAM, BILLING tickets to FINANCE_TEAM, and GENERAL tickets to SUPPORT_TEAM when priority is not CRITICAL, so that each request reaches the appropriate team.
10. As an app user, I want to see the assigned team on a created ticket, so that I know who owns the request.
11. As an app user, I want the created ticket to be persisted before notification recording begins, so that notification failures do not erase my ticket.
12. As an app user, I want a notification record created after successful ticket creation, so that the system records the assignment event.
13. As an app user, I want ticket creation to succeed when notification recording fails, so that a secondary failure does not reverse the primary operation.
14. As an app user, I want to see notification records, so that I can confirm which ticket events were recorded.
15. As an app user, I want to list support tickets, so that I can review work in the system.
16. As an app user, I want to filter tickets by status or category, so that I can find relevant work.
17. As an app user, I want ticket lists paginated with a default page of 1 and limit of 20, with a maximum limit of 100, so that large lists remain manageable.
18. As an app user, I want ticket results ordered by creation time and then ID in descending order, so that pagination is deterministic.
19. As an app user, I want to retrieve a support ticket by ID, so that I can inspect its details.
20. As an app user, I want a missing ticket to return 404 and a malformed UUID to return 400, so that lookup failures are clear.
21. As an app user, I want to move an OPEN ticket to IN_PROGRESS, so that work can begin.
22. As an app user, I want to move an IN_PROGRESS ticket to RESOLVED, so that completed work can be closed.
23. As an app user, I want invalid status transitions to be rejected, so that the ticket lifecycle remains consistent.
24. As an app user, I want conflicting concurrent status updates to return 409, so that one update cannot silently overwrite another.
25. As an app user, I want understandable error responses for invalid input and domain errors, so that I can correct failed requests.
26. As an app user, I want the React dashboard to show tickets, status, priority, assigned team, and notification records, so that I can understand current work at a glance.
27. As an app user, I want a form to create a support ticket from the dashboard, so that I can use the core workflow without calling the API directly.
28. As an app user, I want to filter the dashboard by ticket status, so that I can focus on work in a particular lifecycle state.
29. As an app user, I want to open a ticket detail view and see its assigned team, so that I can inspect an individual request.
30. As an app user, I want the detail view to offer only allowed status transitions, so that invalid actions are harder to request.
31. As an app user, I want loading, empty, and error states in the UI, so that the interface remains understandable during normal and failed requests.
32. As an API consumer, I want business endpoints under `/api/v1`, so that API routes have a stable version prefix.
33. As an API consumer, I want Swagger UI at `/api/docs`, so that I can explore the API interactively.
34. As an API consumer, I want the generated OpenAPI document at `/api/docs-json`, so that tools can consume the API contract.
35. As an API consumer, I want Swagger documentation to describe every business endpoint and `/health`, including request, response, and error schemas, so that I can integrate without guessing.
36. As an operator, I want `GET /health` to report when the backend is initialized and able to serve requests, so that I can check service health.
37. As a developer, I want to run the full system with Docker Compose on a clean Docker environment, so that setup does not require local Node.js or PostgreSQL.
38. As an operator, I want database migrations to run automatically before the backend starts, so that a fresh database has the required schema.
39. As an operator, I want ticket and notification data to survive container recreation, so that restarting the system does not erase application data.
40. As a developer, I want Routing and Notification accessed through public capability contracts, so that business modules can be composed without importing each other's infrastructure.
41. As a developer, I want domain and application logic independent of NestJS and Drizzle, so that core behavior can be tested without infrastructure startup.
42. As a developer, I want Routing policies replaceable by a fake implementation in tests, so that ticket orchestration can be tested independently.
43. As a reviewer, I want tests to prove ticket rules, routing precedence, persistence behavior, and notification failure handling, so that the architecture and business behavior are verifiable.
44. As a reviewer, I want documentation of the module boundaries, setup, API, decisions, and actual AI-assisted development, so that I can understand and reproduce the proof of concept.

## Implementation Decisions

- Implement one deployable NestJS modular monolith with Ticket, Routing, and Notification modules. The React frontend is a separately built application.
- Use React, Vite, TypeScript, and Tailwind CSS for the frontend. Use NestJS and TypeScript for the backend, PostgreSQL for persistence, and Drizzle ORM only in infrastructure adapters.
- Keep domain entities free of NestJS, HTTP, SQL, and ORM dependencies. Application use cases depend on domain objects and repository or capability contracts. NestJS composition wires concrete adapters to those contracts.
- Ticket owns its entity, lifecycle rules, repository, HTTP endpoints, and persistence. Routing owns team-selection policy and exposes a public routing capability. Notification owns notification records and exposes a public recording capability. No module accesses another module's database tables directly.
- Routing rules are deterministic and configured in code. CRITICAL priority overrides category; otherwise TECHNICAL routes to ENGINEERING_TEAM, BILLING to FINANCE_TEAM, and GENERAL to SUPPORT_TEAM.
- Support ticket statuses are OPEN, IN_PROGRESS, and RESOLVED. Only OPEN → IN_PROGRESS and IN_PROGRESS → RESOLVED are allowed. Reopening, cancellation, comments, and attachments are excluded.
- Ticket creation validates the request, obtains a Routing decision, constructs and persists the support ticket, then requests notification recording. A notification failure is logged and does not undo a committed ticket. No external message is sent and no event bus or durable-delivery guarantee is added.
- Persist tickets and notification records in separate logical database schemas. Notification keeps a logical ticket ID and does not add a cross-module foreign key. Use database constraints for allowed category, priority, and status values.
- Expose create, list, retrieve, and status-update ticket endpoints; notification listing; and health checking. Business routes use `/api/v1`. List filters support status and category; pagination defaults to page 1 and limit 20, capped at 100, with deterministic descending ordering. Use 400 for malformed input, 404 for unknown tickets, and 409 for invalid or conflicting status changes. Use a consistent error envelope.
- Generate OpenAPI from NestJS controllers and DTO metadata with `@nestjs/swagger`. Expose unauthenticated Swagger UI at `/api/docs` and OpenAPI JSON at `/api/docs-json`. Document all business endpoints and health checking, with request, response, and error schemas. This remains a local proof of concept without authentication; do not expose it publicly without authentication and authorization.
- The frontend provides a ticket dashboard, create form, detail view, status update controls, filters, and a compact notification display. Use TanStack Query for server state and React Hook Form with Zod for form validation; do not add a global state library without need.
- Docker Compose runs frontend, backend, PostgreSQL, and a one-shot migration service. Frontend requests proxy through `/api`; data uses a persistent volume. Backend and migration use the same image build definition.
- Keep the implementation small. Do not add microservices, a message broker, authentication, RBAC, actual notification delivery, workflow builders, SLA management, or production notification guarantees.

## Testing Decisions

- A good test proves consumer-visible behavior, boundaries, ordering, transitions, failure outcomes, or persistence. Avoid tests that only assert wiring, mocks echoing inputs, incidental defaults, or implementation details.
- Primary acceptance seam: run the full stack through Docker Compose and exercise the browser workflow. Create a ticket, observe its assigned team and notification record, open its details, and update status. Verify invalid transitions and visible error handling.
- Add focused unit tests for support-ticket creation invariants, allowed and forbidden status transitions, Routing precedence, and ticket orchestration. Use fake repository and capability implementations where the test targets application behavior.
- Add Supertest API tests against a bootstrapped NestJS app for successful creation, retrieval, pagination, status transitions, validation errors, missing tickets, and the OpenAPI document's endpoint coverage.
- Add PostgreSQL integration tests for repository insert/read and status persistence, notification persistence, and migrations from an empty database.
- Add a lightweight architecture check or documented repeatable inspection for dependency boundaries. Do not build a custom architecture-testing framework.
- No application source or existing tests were found in the repository, so there is no test implementation to reuse. The project specification defines the intended unit, API, and database integration coverage; the agreed primary seam adds a Compose-backed browser workflow.

## Out of Scope

- Authentication, authorization, and RBAC.
- Actual email, SMS, push, or other notification delivery.
- Real-time WebSockets, file attachments, comments, and SLA management.
- Reopening or cancelling resolved tickets.
- Redis, Kafka, RabbitMQ, an asynchronous event bus, or microservices.
- Kubernetes, complex workflow builders, and production-grade delivery guarantees.
- Features beyond the existing MVP specification unless separately approved.

## Further Notes

- The source architecture specification is the authoritative detailed reference for module contracts, database fields, Docker configuration, milestones, and demo expectations.
- The domain glossary defines “support ticket,” “Routing,” “Team,” and “Notification record.” Use those terms consistently.
- The implementation is complete on `integration/support-ticket`; the source architecture specification remains the authoritative acceptance reference.

## Answer

All seven implementation tickets are resolved on `integration/support-ticket`. Verification: 36 backend tests, production Docker builds, disposable four-service fresh-database smoke, and browser workflows for creation, routing, notifications, browsing, status conflicts, filtering, pagination, and Unicode boundaries. The API is documented through Swagger; setup, architecture, decisions, and demo are documented in the repository. Human approval remains unrecorded in the AI development log.
