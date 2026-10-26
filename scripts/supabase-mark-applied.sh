#!/usr/bin/env bash
# Tells the Supabase CLI that every migration in supabase/migrations/ has
# already been applied to the linked database, WITHOUT running any of them.
#
# Use it once, on a database whose structure already matches the latest
# migration — e.g. a fresh test project where you ran supabase/schema.sql in
# the SQL editor. After that, `npx supabase db push` only runs newer files.
#
# Never run it against a database whose real migration state you haven't
# checked: it would hide migrations that were never applied.
#
# Usage: scripts/supabase-mark-applied.sh [last-version]
#   last-version  optional, e.g. 0030 — only mark migrations up to this one.
set -euo pipefail
cd "$(dirname "$0")/.."

last="${1:-}"
versions=()
for f in supabase/migrations/*.sql; do
  v="$(basename "$f" | sed -E 's/^([0-9]+)_.*/\1/')"
  if [[ -n "$last" && "$v" > "$last" ]]; then continue; fi
  versions+=("$v")
done

if [[ ${#versions[@]} -eq 0 ]]; then
  echo "No migrations to mark." >&2
  exit 1
fi

echo "Marking ${#versions[@]} migrations as applied (${versions[0]} .. ${versions[${#versions[@]}-1]}) on the linked project."
npx supabase migration repair --status applied "${versions[@]}"
