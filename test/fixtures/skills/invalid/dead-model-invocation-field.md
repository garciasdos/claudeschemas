---
name: rotate-keys
description: Rotates the API keys of the staging environment and records the new key ids.
when_to_use: Use when a key has leaked or the quarterly rotation is due.
paths: infra/**
disable-model-invocation: true
---

# Rotate keys

Rotate each key in turn, wait for the health check, then record the new id in the register.
