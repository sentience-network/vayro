#!/usr/bin/env bash
set -euo pipefail

# Render can restart a service while a previous deploy process is still
# releasing its connection. Neon pooled endpoints also do not reliably
# support Prisma's session advisory lock. Disable only that lock and retry
# migrations so a transient database connection does not take the web service
# down in a restart loop. The same logic is also used by npm run db:deploy so
# existing Render services using the old dashboard start command are covered.
if [[ "${SKIP_DB_MIGRATIONS:-0}" != "1" ]]; then
  npm run db:deploy
fi

exec npm run start
