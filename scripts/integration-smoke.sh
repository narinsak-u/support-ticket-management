#!/usr/bin/env bash
set -euo pipefail

root=$(cd "$(dirname "$0")/.." && pwd)
project="support-ticket-smoke-$$"
compose=(docker compose -p "$project" -f "$root/compose.integration.yml")
cleanup() {
  "${compose[@]}" down --volumes --remove-orphans
}
trap cleanup EXIT

"${compose[@]}" up --build -d backend frontend
address=$("${compose[@]}" port backend 3000)
port=${address##*:}
base="http://127.0.0.1:$port/api/v1"
frontendAddress=$("${compose[@]}" port frontend 5173)
frontendPort=${frontendAddress##*:}
frontend="http://127.0.0.1:$frontendPort"
for attempt in {1..60}; do
  if curl --fail --silent "$base/notifications" >/dev/null &&
    curl --fail --silent "$frontend/" >/dev/null &&
    curl --fail --silent "$frontend/@vite/client" >/dev/null; then break; fi
  if (( attempt == 60 )); then
    echo "Full stack did not become ready" >&2
    exit 1
  fi
  sleep 1
done

seededTickets=$(curl --fail --silent --show-error "$base/tickets?limit=100")
seededNotifications=$(curl --fail --silent --show-error "$base/notifications?limit=100")
"${compose[@]}" exec -T backend node - "$seededTickets" "$seededNotifications" <<'NODE'
const [tickets, notifications] = process.argv.slice(2).map(JSON.parse);
if (tickets.pagination.total !== 5 || tickets.data.length !== 5) {
  throw new Error('Fresh database did not receive five seeded tickets');
}
if (notifications.pagination.total !== 5 || notifications.data.length !== 5) {
  throw new Error('Seed ticket notifications were not recorded');
}
NODE

"${compose[@]}" restart backend >/dev/null
address=$("${compose[@]}" port backend 3000)
port=${address##*:}
base="http://127.0.0.1:$port/api/v1"
for attempt in {1..60}; do
  if curl --fail --silent "$base/tickets?limit=100" >/dev/null; then break; fi
  if (( attempt == 60 )); then
    echo "Backend did not become ready after restart" >&2
    exit 1
  fi
  sleep 1
done
restartedTickets=$(curl --fail --silent --show-error "$base/tickets?limit=100")
restartedNotifications=$(curl --fail --silent --show-error "$base/notifications?limit=100")
"${compose[@]}" exec -T backend node - "$restartedTickets" "$restartedNotifications" <<'NODE'
const [tickets, notifications] = process.argv.slice(2).map(JSON.parse);
if (tickets.pagination.total !== 5 || notifications.pagination.total !== 5) {
  throw new Error('Backend restart duplicated or lost seed data');
}
NODE

created=$(curl --fail --silent --show-error -H 'content-type: application/json' \
  -d '{"title":"Integration smoke ticket","description":"Persisted from a fresh database","category":"BILLING","priority":"HIGH"}' \
  "$base/tickets")
id=$("${compose[@]}" exec -T backend node -e 'const t=JSON.parse(process.argv[1]); if (!t.id || t.assignedTeamCode !== "FINANCE_TEAM") process.exit(1); process.stdout.write(t.id)' "$created")
list=$(curl --fail --silent --show-error "$base/tickets")
detail=$(curl --fail --silent --show-error "$base/tickets/$id")
notifications=$(curl --fail --silent --show-error "$base/notifications")
ticketPage2=$(curl --fail --silent --show-error "$base/tickets?page=2")
notificationPage2=$(curl --fail --silent --show-error "$base/notifications?page=2")
progress=$(curl --fail --silent --show-error -X PATCH -H 'content-type: application/json' \
  -d '{"status":"IN_PROGRESS"}' "$base/tickets/$id/status")
resolved=$(curl --fail --silent --show-error -X PATCH -H 'content-type: application/json' \
  -d '{"status":"RESOLVED"}' "$base/tickets/$id/status")
after=$(curl --fail --silent --show-error "$base/tickets/$id")
filtered=$(curl --fail --silent --show-error "$base/tickets?status=RESOLVED&category=BILLING&page=1&limit=1")
invalid=$(curl --silent --output /dev/null --write-out '%{http_code}' -X PATCH -H 'content-type: application/json' \
  -d '{"status":"OPEN"}' "$base/tickets/$id/status")
bounded=$(curl --silent --output /dev/null --write-out '%{http_code}' "$base/tickets?limit=101")
"${compose[@]}" exec -T backend node - "$created" "$list" "$detail" "$notifications" "$id" "$progress" "$resolved" "$after" "$filtered" "$invalid" "$bounded" "$ticketPage2" "$notificationPage2" <<'NODE'
const [created, list, detail, notifications] = process.argv.slice(2, 6).map(JSON.parse);
const id = process.argv[6];
const [progress, resolved, after, filtered] = process.argv.slice(7, 11).map(JSON.parse);
const [invalid, bounded] = process.argv.slice(11, 13);
const [ticketPage2, notificationPage2] = process.argv.slice(13, 15).map(JSON.parse);
if (list.data.length !== 5 || list.pagination.limit !== 5 || list.pagination.total !== 6) {
  throw new Error('Ticket default page size or total mismatch');
}
if (notifications.data.length !== 5 || notifications.pagination.limit !== 5 || notifications.pagination.total !== 6) {
  throw new Error('Notification default page size or total mismatch');
}
if (ticketPage2.data.length !== 1 || ticketPage2.pagination.page !== 2 || ticketPage2.pagination.total !== 6) {
  throw new Error('Ticket page 2 is incorrect');
}
if (notificationPage2.data.length !== 1 || notificationPage2.pagination.page !== 2 || notificationPage2.pagination.total !== 6) {
  throw new Error('Notification page 2 is incorrect');
}
if (!list.data.some(ticket => ticket.id === id)) throw new Error('Ticket absent from list');
if (detail.id !== id || detail.title !== created.title) throw new Error('Ticket detail mismatch');
if (!notifications.data.some(record => record.ticketId === id && record.type === 'TICKET_CREATED')) {
  throw new Error('Persisted notification absent');
}
if (progress.status !== 'IN_PROGRESS' || resolved.status !== 'RESOLVED' || after.status !== 'RESOLVED') {
  throw new Error('Status transition was not persisted');
}
if (filtered.pagination.total !== 1 || filtered.data[0]?.id !== id) throw new Error('Filtered list missed updated ticket');
if (invalid !== '409' || bounded !== '400') throw new Error('Status or page limit validation mismatch');
NODE

echo "Fresh-database ticket, status and notification persistence passed ($id)"
