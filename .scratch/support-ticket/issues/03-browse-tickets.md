# 03: Browse support tickets and notification records

**What to build:** A user reviews saved support tickets and notification records in the dashboard, and can retrieve a ticket through the API.

**Blocked by:** 02: Create and route a support ticket

**Status:** ready-for-agent

- [ ] The dashboard displays ticket title, status, priority, assigned Team, and notification records.
- [ ] The ticket list and notification list show persisted records in their documented order.
- [ ] The API returns ticket lists and individual ticket details; missing IDs return 404 and malformed UUIDs return 400.
- [ ] Loading, empty, and request-error states are understandable in the UI.
- [ ] Browser and API tests prove saved tickets and notification records are visible after creation.
