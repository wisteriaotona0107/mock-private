#!/usr/bin/env bash
set -euo pipefail
PG_DUMP_BIN=${PG_DUMP_BIN:-pg_dump}
BACKUP_DIR=${BACKUP_DIR:-/var/backups/postgres}
mkdir -p "$BACKUP_DIR"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
$PG_DUMP_BIN "$DATABASE_URL" > "$BACKUP_DIR/backup_$TIMESTAMP.sql"
