---
name: explain-build-pipeline
description: >-
  Explains how the build pipeline works, stage by stage, including the install stage, the type
  checking stage, the lint stage, the unit test stage, the integration test stage, the bundling
  stage and the publish stage, and for each one names the command it runs, the files it reads,
  the artefacts it writes, the environment variables it needs, the cache keys it restores and
  saves, the conditions under which it is skipped, the typical duration on a warm cache, the
  typical duration on a cold cache, the owner to contact when it fails, the dashboards that show
  its history, the retry policy applied to flaky failures, the notification channels that receive
  its results, the way its logs are retained, the retention window for its artefacts, the branch
  protection rules that depend on it, the merge queue behaviour when it is red, the manual escape
  hatches available to release managers, the differences between the pull request pipeline and
  the main branch pipeline, the differences between the nightly pipeline and the release
  pipeline, the way secrets are injected into it, the way its runners are sized, the way its
  concurrency limits are configured, and the migration plan that will replace it next quarter
  once the new runner fleet is available in every region where the team operates today.
when_to_use: >-
  Use when a new engineer asks how the build works, when a pipeline stage fails and nobody knows
  who owns it, or when someone proposes a change to the pipeline and needs the current behaviour
  written down first so the proposal can be reviewed against what exists today.
---

# Explain the build pipeline

Walk the stages in order and stop after the stage the user asked about.
