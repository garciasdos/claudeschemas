---
name: deploy-staging
description: Deploys the current commit to the staging environment and waits for the health check to pass.
when_to_use: Use only when the user asks for a staging deploy by name.
disable-model-invocation: yes
user-invocable: on
effort: medium
allowed-tools: Bash(./scripts/deploy.sh:*)
---

# Deploy to staging

1. Confirm the working tree is clean and the current commit is pushed.
2. Run the deploy script for the staging environment.
3. Poll the health endpoint until it reports ready, then report the deployed commit.
