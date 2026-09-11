---
name: format-imports
description: Sorts and groups the import statements of a TypeScript file the way this repository does, so diffs stay small. Use when imports are out of order or a review asks for them to be tidied.
---

# Format imports

1. Read the file the user named.
2. Group the imports into node builtins, third-party packages and local modules, in that order.
3. Sort each group by module path, case-insensitively.
4. Leave a single blank line between groups and none inside them.
