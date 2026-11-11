# 01: Move ticket browsing coordination into a feature hook

**What to build:** Support agents can continue filtering and paging the queue, selecting a support ticket, and viewing its details. The browser also corrects invalid pages and refreshes affected queue and detail data after a status change.

**Blocked by:** None (can start immediately)

**Status:** resolved

- [x] Category and status filters reset the page and clear the explicit selection; the first result on the current page supplies the detail panel when no ticket is selected.
- [x] Selecting a support ticket from the browser or a Notification record shows that ticket's details.
- [x] An out-of-range page is corrected after result counts change, with selection behavior preserved.
- [x] Successful status changes refresh the queue and affected ticket details.
- [x] Move filter/page state, list/detail queries, active-ticket derivation, page correction, and cache invalidation coordination into a Tickets feature hook; keep UI rendering in components.
- [x] Browser smoke check confirms filtering, pagination, selection/detail display, and post-update refresh.

## Answer

The hook now owns browser query and selection coordination. Production build passed. Browser smoke verified filtering, page reset and navigation, ticket selection/detail display, and queue/detail refresh after a successful status update.