# 05: Filter and paginate support tickets

**What to build:** A user narrows the dashboard ticket list by status or category and moves through stable pages of results.

**Blocked by:** 03: Browse support tickets and notification records

**Status:** ready-for-agent

- [ ] The UI and API filter ticket lists by status and category.
- [ ] Pagination defaults to page 1 and limit 20; a limit above 100 receives the documented validation error.
- [ ] Results sort by creation time descending, then ID descending, so pages remain deterministic.
- [ ] Filter and pagination changes update the displayed results and preserve clear loading, empty, and error states.
- [ ] API and browser tests cover filter combinations, defaults, maximum limit, and deterministic ordering.
