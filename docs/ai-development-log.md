# AI-Assisted Development Log

This log records only prompts, decisions, and checks present in the development evidence. Prompt summaries are explicitly labeled; no human code approval or separate human evaluation was recorded.

## 1. Business modules and capability split

- **Task:** Implement Ticket, Routing, Notification, and UI feature slices in the modular-monolith design.
- **Tool:** AI coding agents coordinated by the orchestrator.
- **Prompt:** **Paraphrase of the recorded task prompts:** implement the assigned Ticket, Routing, Notification, or UI feature slice; later tasks added the ticket status state machine with a conditional PostgreSQL update and combined category/status filters with bounded pagination.
- **AI recommendation:** The exact recommendations and full prompt text were not retained in the evidence available for this log.
- **Human evaluation:** No separate human evaluation was recorded. The orchestrator's review is recorded below as agent evaluation, not human approval.
- **Final decision:** Build the requested features within the three business modules and UI. The user explicitly requested the project name `support-ticket` and Swagger API documentation; those choices were followed.
- **Validation evidence:** Ticket 04/05 checks recorded 32 backend tests passing across 8 files, a backend build passing, and Docker Compose starting frontend/backend/PostgreSQL with migration completion and healthy backend. A real PostgreSQL API check created TECHNICAL/HIGH assigned to `ENGINEERING_TEAM`, advanced status, rejected reopen with 409, and checked filters and invalid requests. Chromium showed list/detail status updates.
- **Lesson:** Describe actual module/capability boundaries and observed checks; do not turn absent approval or AI rationale into recorded facts.

## 2. Pagination implementation review

- **Task:** Add combined category/status filters with bounded pagination.
- **Tool:** AI coding agent, followed by orchestrator review.
- **Prompt:** **Paraphrase of the recorded prompt:** implement combined category/status filtering and bounded pagination.
- **AI recommendation:** The agent's full response was not retained in the evidence available for this log.
- **Evaluation:** **Agent evaluation:** review found the list endpoint's `@Get()` decorator missing and the `TICKET_REPOSITORY` dependency-injection token removed in the pagination branch.
- **Final decision:** Restore both the route decorator and repository token before verification. No human decision was recorded.
- **Validation evidence:** The final ticket 04/05 run recorded `npm test` passing 32 tests across 8 files and `npm run build` passing in the backend. API checks exercised combined filters and rejected `limit=101` with 400.
- **Lesson:** Review generated changes for framework wiring and dependency-injection registrations, not only business logic.

## 3. Docker TypeScript cache failure

- **Task:** Diagnose a failed container build after an incremental TypeScript cache file entered the Docker build context.
- **Tool:** AI-assisted implementation workflow; the exact tool invocation and prompt were not retained.
- **Prompt:** **Paraphrase of the recorded task:** investigate and correct the container build failure caused by cached TypeScript build state.
- **AI recommendation:** No recommendation text was retained; this log does not attribute an undocumented suggestion.
- **Human evaluation:** No separate human evaluation was recorded.
- **Final decision:** Exclude `*.tsbuildinfo` from `.dockerignore` context so the Docker build does not reuse a cache whose ignored `dist` output was absent.
- **Validation evidence:** The initial container build failed because TypeScript skipped emit while `dist` was ignored. After the cache exclusion, the subsequent isolated smoke check passed. The latest recorded `bash scripts/integration-smoke.sh` passed against fresh isolated PostgreSQL, covering migration, ticket and notification persistence, status transitions, filtered listing, invalid reopen (409), and `limit=101` (400); its disposable volume was cleaned.
- **Lesson:** Build context must not carry incremental compiler state that assumes outputs unavailable in the image.

## 4. Swagger reflection metadata

- **Task:** Make the generated OpenAPI contract test work under Vitest and expose Swagger UI/API documentation.
- **Tool:** AI-assisted implementation workflow; the exact prompt and tool invocation were not retained.
- **Prompt:** **Paraphrase of the recorded task:** investigate why the generated OpenAPI test failed under Vitest and make the documented API schema explicit.
- **AI recommendation:** No recommendation text was retained.
- **Human evaluation:** No separate human evaluation was recorded.
- **Final decision:** Add explicit DTO property types and `@ApiBody` metadata. The user explicitly requested Swagger API documentation. An intermediate edit displaced priority validation; the orchestrator reviewed and restored `@IsIn` before verification. These are recorded agent review/correction steps, not human signoff.
- **Validation evidence:** An initial Vitest OpenAPI test failed because Swagger primitives lacked emitted reflection metadata. After the metadata fix, `npm test -- src/openapi.spec.ts` passed. The recorded live checks returned 200 for `/api/docs`, `/api/docs-json`, and the proxied `/api/docs-json`; the document exposed five paths and ten component schemas.
- **Lesson:** Explicit API metadata makes the generated contract testable where runtime reflection metadata is unavailable; keep request validation intact while changing documentation metadata.

## Recorded user decisions

The user requested renaming the project from FlowDesk to `support-ticket` and adding Swagger for backend API documentation. These are the explicit user decisions recorded here. No separate human code review, approval, or evaluation was recorded.
