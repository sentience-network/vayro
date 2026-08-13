#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${1:-${NEXT_PUBLIC_APP_URL:-https://vayro.onrender.com}}"
BASE_URL="${BASE_URL%/}"

if ! command -v curl >/dev/null 2>&1; then
  echo "curl is required" >&2
  exit 2
fi

failures=0
check() {
  local path="$1"
  local expected="${2:-200}"
  local url="${BASE_URL}${path}"
  local headers body status
  headers="$(mktemp)"
  body="$(mktemp)"
  status="$(curl -sS -L --max-time 25 -D "$headers" -o "$body" -w '%{http_code}' "$url" || true)"
  if [[ "$status" != "$expected" ]]; then
    echo "FAIL $path (expected $expected, got ${status:-connection failure})"
    failures=$((failures + 1))
  else
    echo "PASS $path ($status)"
  fi
  rm -f "$headers" "$body"
}

check_health() {
  local body status
  body="$(mktemp)"
  status="$(curl -sS -L --max-time 25 -o "$body" -w '%{http_code}' "${BASE_URL}/api/health" || true)"
  if [[ "$status" != "200" ]] || ! grep -q '"status":"ok"' "$body" || ! grep -q '"database":"connected"' "$body"; then
    echo "FAIL /api/health (status ${status:-connection failure}; expected status=ok and database=connected)"
    failures=$((failures + 1))
  else
    echo "PASS /api/health (database connected)"
  fi
  rm -f "$body"
}

echo "Vayro smoke test: $BASE_URL"
check_health
check "/" 200
check "/browse" 200
check "/demo" 200
check "/pricing" 200
check "/safety" 200
check "/api/health" 200

if [[ "$failures" -gt 0 ]]; then
  echo "$failures smoke test(s) failed." >&2
  exit 1
fi

echo "All Vayro smoke tests passed."
