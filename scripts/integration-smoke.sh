#!/usr/bin/env bash
set -euo pipefail

root=$(cd "$(dirname "$0")/.." && pwd)
project="support-ticket-smoke-$$"
compose=(docker compose -p "$project" -f "$root/compose.integration.yml")
cleanup() {
  "${compose[@]}" down --volumes --remove-orphans
}
trap cleanup EXIT

"${compose[@]}" up --build -d backend
address=$("${compose[@]}" port backend 3000)
port=${address##*:}
base="http://127.0.0.1:$port/api/v1"
for attempt in {1..60}; do
  if curl --fail --silent "$base/notifications" >/dev/null; then break; fi
  if (( attempt == 60 )); then
    echo "Backend did not become ready" >&2
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
"${compose[@]}" exec -T backend node - "$created" "$list" "$detail" "$notifications" "$id" <<'NODE'
const [created, list, detail, notifications] = process.argv.slice(2, 6).map(JSON.parse);
const id = process.argv[6];
if (!list.data.some(ticket => ticket.id === id)) throw new Error('Ticket absent from list');
if (detail.id !== id || detail.title !== created.title) throw new Error('Ticket detail mismatch');
if (!notifications.data.some(record => record.ticketId === id && record.type === 'TICKET_CREATED')) {
  throw new Error('Persisted notification absent');
}
NODE

echo "Fresh-database ticket and notification persistence passed ($id)"
