# 02: Manage ticket status updates with mutation state

**What to build:** Support agents can advance a support ticket through its allowed lifecycle and receive clear pending or error feedback. Successful updates refresh the visible ticket state.

**Blocked by:** None (can start immediately)

**Status:** ready-for-agent

- [ ] Only the existing allowed status transitions are offered.
- [ ] The action shows pending feedback while the update is in progress and disables repeat submission.
- [ ] Update failures retain entered context and show the current user-facing error feedback.
- [ ] Successful updates trigger the existing queue and detail refresh behavior.
- [ ] Manage pending/error state with TanStack Query's mutation API, preserving current observable behavior.
- [ ] Browser smoke check confirms a successful transition and visible failure feedback.