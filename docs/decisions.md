# Architecture Decisions

## ADR-001: Modular Monolith over Microservices

**Decision:** Deploy one backend process with internal business modules.

**Reason:** This minimizes operational complexity while demonstrating explicit Ticket, Routing, and Notification boundaries.

**Trade-off:** Modules cannot scale or deploy independently. A monolith also shares process failure across business contexts.

## ADR-002: NestJS as Outer Framework

**Decision:** Use NestJS for HTTP handling and dependency-injection composition only; keep business logic framework-independent.

**Reason:** Core behavior can be exercised without starting the web framework, and Nest provides the app's HTTP and provider wiring.

**Trade-off:** Explicit provider wiring and adapters add setup work. Presentation and composition remain tied to NestJS.

## ADR-003: Synchronous Capability Contracts

**Decision:** Compose module capabilities through in-process interfaces, not internal REST calls or a message broker.

**Reason:** Typed contracts make module dependencies explicit with less operational machinery for this PoC.

**Trade-off:** There is no process-level isolation or independent deployment. Synchronous calls share process availability and execution.

## ADR-004: Best-effort Notification Recording

**Decision:** Commit the ticket first, then attempt notification recording; log notification failure without failing the successful ticket operation.

**Reason:** A secondary notification failure must not reverse the main Ticket operation.

**Trade-off:** A crash after ticket commit can leave a ticket without a notification record. Recording is not durable delivery and has no retry guarantee. A future reliability requirement would need a transactional outbox, retrying worker, and idempotent consumption.

## ADR-005: PostgreSQL and Drizzle

**Decision:** Use PostgreSQL with Drizzle-based repository adapters.

**Reason:** PostgreSQL provides relational integrity and predictable local deployment; adapters keep database mapping outside domain logic.

**Trade-off:** Persistence records require mapping to and from domain objects. Drizzle remains an infrastructure dependency.

## ADR-006: No Authentication in MVP

**Decision:** Run a single-user local demonstration without authentication or authorization.

**Reason:** Authentication is not required to demonstrate the requested architecture concepts.

**Trade-off:** The API has no access control. Compose binds published ports only to `127.0.0.1` as a local-demo safeguard; it does not make public deployment safe. Do not expose this app publicly without authentication, authorization, and appropriate deployment security controls.
