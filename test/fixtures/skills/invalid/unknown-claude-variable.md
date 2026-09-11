---
name: render-chart
description: Renders a chart from a CSV file using the script bundled with this skill.
allowed-tools: Bash(${CLAUDE_SKILL_DIR}/scripts/render.sh *)
---

# Render a chart

Run ${CLAUDE_SKILL_DIRECTORY}/scripts/render.sh with the CSV file the user named, then describe
what the chart shows in two sentences.
