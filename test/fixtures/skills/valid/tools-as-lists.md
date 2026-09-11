---
name: run-migrations
description: Applies pending database migrations against the local development database and verifies the result.
when_to_use: Use when the schema changed, after pulling new migrations, or when someone asks to migrate the local database.
allowed-tools:
  - Read
  - Bash(npm run migrate:*)
  - Bash(psql:*)
disallowed-tools:
  - AskUserQuestion
paths:
  - db/migrations/**
  - db/schema.sql
shell: bash
user-invocable: true
---

# Run migrations

1. List the pending migrations and show them before applying anything.
2. Apply them one at a time, stopping at the first failure.
3. Dump the resulting schema back into `db/schema.sql`.
