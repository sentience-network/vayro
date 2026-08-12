#!/usr/bin/env bash
set -euo pipefail

for attempt in 1 2 3 4 5; do
  if PRISMA_SCHEMA_DISABLE_ADVISORY_LOCK=1 npx prisma migrate deploy; then
    exit 0
  fi
  if [[ "$attempt" -lt 5 ]]; then
    sleep $((attempt * 3))
  fi
done

echo "Database migrations did not complete after 5 attempts." >&2
exit 1
