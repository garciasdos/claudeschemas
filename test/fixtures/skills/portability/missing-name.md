---
description: Renames the exported symbols of a module and updates every import that refers to them. Use when someone asks for a symbol to be renamed across the project.
license: MIT
allowed-tools: Read Grep
---

# Rename exported symbols

1. Find every import of the symbol the user named.
2. Rename the export and each import that refers to it.
3. Report the files touched and anything left referring to the old name.
