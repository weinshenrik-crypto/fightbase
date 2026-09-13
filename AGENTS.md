# Fightbase — Hinweise für Coding-Agents

Die eigentliche Projektdokumentation steht in **CLAUDE.md**: Befehle, Aufbau,
wie Events gepflegt werden, belegte Quellen, Konventionen und die Liste dessen,
was hier bewusst nicht gemacht wird. Diese Datei ergänzt sie nur.

Der Block unten stammt nicht von Hand, sondern von `next dev`
(`node_modules/next/dist/server/lib/generate-agent-files.js`). Next schreibt ihn
bei jedem Dev-Start und legt ihn in `AGENTS.md` ab, sobald es diese Datei gibt —
sonst hängt es ihn an `CLAUDE.md` an und macht damit bei jedem `npm run dev` den
Arbeitsbaum schmutzig. Genau dafür existiert diese Datei. Sie nicht löschen und
den Block nicht von Hand bearbeiten: Ein Next-Upgrade ersetzt ihn ohnehin, und
die Änderung gehört dann in denselben Commit wie das Upgrade.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
