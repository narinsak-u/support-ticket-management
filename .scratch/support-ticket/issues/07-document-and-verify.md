# 07: Document and verify the complete app

**What to build:** A reviewer can start the support-ticket app from a clean Docker environment, complete its main workflow, and understand its architecture and limits.

**Blocked by:** 01: Start app and pass health check; 02: Create and route a support ticket; 03: Browse support tickets and notification records; 04: Inspect and advance ticket status; 05: Filter and paginate support tickets; 06: Explore the API with Swagger

**Status:** ready-for-agent

- [ ] A clean Compose startup applies migrations, reaches healthy state, and serves the frontend without local Node.js or PostgreSQL.
- [ ] A browser end-to-end check creates a ticket, verifies its Team and notification record, lists and opens it, updates its status, and observes invalid-transition feedback.
- [ ] Architecture and setup documentation explain module responsibilities, dependency boundaries, API usage, limitations, and reproducible startup.
- [ ] Required architecture decisions and a demo walkthrough are documented.
- [ ] The AI development log records only actual prompts, human decisions, and validation evidence; no conversations or results are invented.
- [ ] A final review confirms the implementation meets the source spec's acceptance criteria without adding out-of-scope features.
