---
name: convert-notebook
description: Converts a Jupyter notebook into a plain script, keeping the markdown cells as comments.
compatibility: >-
  Requires Claude Code v2.1.218 or later on macOS, Linux or Windows with Git Bash installed, plus
  Python 3.11 or later with jupyter, nbformat and nbconvert available on the path, a writable
  cache directory under the project root, network access to the internal package index, at least
  two gigabytes of free disk space for the intermediate artefacts, a terminal that reports a
  width of at least eighty columns, and a repository checkout that contains the notebooks under a
  directory the session can read without an additional permission prompt from the user.
---

# Convert a notebook

Write the script next to the notebook and keep the cell order unchanged.
