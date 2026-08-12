#!/usr/bin/env bash
set -euo pipefail

# Render can restart a service while a previous deploy process is still
# releasing its connection. Neon pooled endpoints also do not reliably
# support Prisma's session advisory lock. Disable only that lock and retry
# migrations so a transient database connection does not take the web service
# down in a restart loop.
if [[ "${SKIP_DB_MIGRATIONS:-0}" != "1" ]]; then
  migrated=0
  for attempt in 1 2 3 4 5; do
    if PRISMA_SCHEMA_DISABLE_ADVISORY_LOCK=1 npx prisma migrate deploy; then
      migrated=1
      break
    fi
    if [[ "$attempt" -lt 5 ]]; then
      sleep $((attempt * 3))
    fi
  done

  if [[ "$migrated" -ne 1 ]]; then
    echo "Database migrations did not complete after 5 attempts." >&2
    exit 1
  fi
fi

exec npm run start
