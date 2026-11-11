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

created=$(curl --fail --silent --show-error -H 'content-type: application/json' \
  -d '{"title":"Integration smoke ticket","description":"Persisted from a fresh database","category":"BILLING","priority":"HIGH"}' \
  "$base/tickets")
id=$("${compose[@]}" exec -T backend node -e 'const t=JSON.parse(process.argv[1]); if (!t.id || t.assignedTeamCode !== "FINANCE_TEAM") process.exit(1); process.stdout.write(t.id)' "$created")
list=$(curl --fail --silent --show-error "$base/tickets")
detail=$(curl --fail --silent --show-error "$base/tickets/$id")
notifications=$(curl --fail --silent --show-error "$base/notifications")
progress=$(curl --fail --silent --show-error -X PATCH -H 'content-type: application/json' \
  -d '{"status":"IN_PROGRESS"}' "$base/tickets/$id/status")
resolved=$(curl --fail --silent --show-error -X PATCH -H 'content-type: application/json' \
  -d '{"status":"RESOLVED"}' "$base/tickets/$id/status")
after=$(curl --fail --silent --show-error "$base/tickets/$id")
filtered=$(curl --fail --silent --show-error "$base/tickets?status=RESOLVED&category=BILLING&page=1&limit=1")
invalid=$(curl --silent --output /dev/null --write-out '%{http_code}' -X PATCH -H 'content-type: application/json' \
  -d '{"status":"OPEN"}' "$base/tickets/$id/status")
bounded=$(curl --silent --output /dev/null --write-out '%{http_code}' "$base/tickets?limit=101")
"${compose[@]}" exec -T backend node - "$created" "$list" "$detail" "$notifications" "$id" "$progress" "$resolved" "$after" "$filtered" "$invalid" "$bounded" <<'NODE'
const [created, list, detail, notifications] = process.argv.slice(2, 6).map(JSON.parse);
const id = process.argv[6];
const [progress, resolved, after, filtered] = process.argv.slice(7, 11).map(JSON.parse);
const [invalid, bounded] = process.argv.slice(11, 13);
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
