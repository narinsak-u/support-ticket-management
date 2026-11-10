# 03: Browse support tickets and notification records

**What to build:** A user reviews saved support tickets and notification records in the dashboard, and can retrieve a ticket through the API.

**Blocked by:** 02: Create and route a support ticket

**Status:** resolved

- [x] The dashboard displays ticket title, status, priority, assigned Team, and notification records.
- [x] The ticket list and notification list show persisted records in their documented order.
- [x] The API returns ticket lists and individual ticket details; missing IDs return 404 and malformed UUIDs return 400.
- [x] Loading, empty, and request-error states are understandable in the UI.
- [x] Browser and API tests prove saved tickets and notification records are visible after creation.

## Answer

Browser workflow loads saved tickets, details, and notification records. API tests cover list/detail behavior and malformed or missing IDs; fresh-database smoke confirms records are retrievable after creation.
