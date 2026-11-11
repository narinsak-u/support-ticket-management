# 01: Move ticket browsing coordination into a feature hook

**What to build:** Support agents can continue filtering and paging the queue, selecting a support ticket, and viewing its details. The browser also corrects invalid pages and refreshes affected queue and detail data after a status change.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Category and status filters reset the page and clear the explicit selection; the first result on the current page supplies the detail panel when no ticket is selected.
- [ ] Selecting a support ticket from the browser or a Notification record shows that ticket's details.
- [ ] An out-of-range page is corrected after result counts change, with selection behavior preserved.
- [ ] Successful status changes refresh the queue and affected ticket details.
- [ ] Move filter/page state, list/detail queries, active-ticket derivation, page correction, and cache invalidation coordination into a Tickets feature hook; keep UI rendering in components.
- [ ] Browser smoke check confirms filtering, pagination, selection/detail display, and post-update refresh.