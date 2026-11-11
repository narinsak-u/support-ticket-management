# 04: Inspect and advance ticket status

**What to build:** A user opens a support ticket, sees its details, and advances it through the allowed lifecycle with clear feedback when an update is invalid or conflicts.

**Blocked by:** 03: Browse support tickets and notification records

**Status:** resolved

- [x] The detail view shows the ticket and offers only allowed next statuses.
- [x] OPEN can move to IN_PROGRESS, and IN_PROGRESS can move to RESOLVED; all other transitions are rejected.
- [x] Successful status updates persist and appear in the detail view and ticket list.
- [x] Invalid or concurrent conflicting updates return 409; malformed input returns 400 and unknown tickets return 404.
- [x] Browser and API tests prove allowed transitions, rejected transitions, and conflict behavior.

## Answer

Browser and API checks cover both allowed transitions, invalid and stale updates, 400/404 errors, and conditional concurrent writes yielding one 200 and one 409. Browser conflict feedback clears when a different ticket is selected.
