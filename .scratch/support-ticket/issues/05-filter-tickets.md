# 05: Filter and paginate support tickets

**What to build:** A user narrows the dashboard ticket list by status or category and moves through stable pages of results.

**Blocked by:** 03: Browse support tickets and notification records

**Status:** resolved

- [x] The UI and API filter ticket lists by status and category.
- [x] Pagination defaults to page 1 and limit 20; a limit above 100 receives the documented validation error.
- [x] Results sort by creation time descending, then ID descending, so pages remain deterministic.
- [x] Filter and pagination changes update the displayed results and preserve clear loading, empty, and error states.
- [x] API and browser tests cover filter combinations, defaults, maximum limit, and deterministic ordering.

## Answer

API tests cover filters, defaults, bounds, and stable ordering; browser checks cover filter combinations. With 21 OPEN tickets, updating the only ticket on page 2 correctly returns the filtered UI to page 1 of 1 with 20 rows.
