# 06: Explore the API with Swagger

**What to build:** An API consumer can explore the complete support-ticket API and its request, response, and error contracts through Swagger and OpenAPI.

**Blocked by:** 02: Create and route a support ticket; 03: Browse support tickets and notification records; 04: Inspect and advance ticket status; 05: Filter and paginate support tickets

**Status:** ready-for-agent

- [ ] Swagger UI is available at `/api/docs` and the OpenAPI JSON is available at `/api/docs-json`.
- [ ] Documentation covers every health and business endpoint, including ticket creation, listing, retrieval, status updates, and notification listing.
- [ ] Documented schemas and error responses match actual API behavior, including validation and status-transition errors.
- [ ] An API test verifies the generated OpenAPI document includes the complete endpoint surface and documented request/response schemas.
