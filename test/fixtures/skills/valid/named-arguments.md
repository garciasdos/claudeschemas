---
name: request-review
description: Opens a review request for a pull request and assigns the reviewer the author asked for. Use when the author asks for a review or names a reviewer.
argument-hint: '[pull-request] [reviewer]'
arguments:
  - pull-request
  - reviewer
allowed-tools:
  - Bash(gh pr edit:*)
  - Bash(gh pr view:*)
---

# Request a review

1. Confirm that pull request $pull-request is open and has a description.
2. Add $reviewer as a reviewer.
3. Leave a comment naming the two files most worth looking at first.
