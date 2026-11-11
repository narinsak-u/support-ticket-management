# 02: Manage ticket status updates with mutation state

**What to build:** Support agents can advance a support ticket through its allowed lifecycle and receive clear pending or error feedback. Successful updates refresh the visible ticket state.

**Blocked by:** None (can start immediately)

**Status:** resolved

- [x] Only the existing allowed status transitions are offered.
- [x] The action shows pending feedback while the update is in progress and disables repeat submission.
- [x] Update failures keep ticket details visible and show the current user-facing error feedback.
- [x] Successful updates trigger the existing queue and detail refresh behavior.
- [x] Manage pending/error state with TanStack Query's mutation API, preserving current observable behavior.
- [x] Browser smoke check confirms a successful transition and visible failure feedback.

## Answer

Production build passed. Browser smoke verified the `Updating…` pending state with the action disabled, a successful transition with refreshed detail, and visible error feedback after a conflicting status update.