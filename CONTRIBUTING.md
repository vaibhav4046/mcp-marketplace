# Contributing

Thanks for helping. Quick guide:

## Add a new MCP server

1. Edit `data/servers.json`.
2. Add a new object to the `servers` array following the schema in `lib/types.ts`.
3. Run `npm run typecheck` to confirm the shape.
4. Open a PR.

The minimum required fields:

- `slug`, `name`, `tagline`
- `author`, `repo`
- `runtime`, `transports`, `categories`
- `install` with at least one of: `claudeDesktop`, `claudeCode`, `cli`, or `docker`

## Local dev

```bash
npm install
npm run dev
```

The dev server reads `data/servers.json` directly — edits hot-reload.

## Project rules

- **No analytics, no trackers.** Ever.
- **No build-time fetches** beyond the explicit `sync` script.
- **Accessible by default.** Every interactive control needs an aria-label or visible label.
- **No emojis in source files** unless it's content the user authored.
- **TypeScript strict.** No `any` without comment.

## File layout

```
app/        Next.js App Router pages
components/ Presentational + interactive UI
lib/        Types + data layer + utilities
data/       The canonical registry (servers.json)
scripts/    Auto-sync entry point
```

## Sync logic

`scripts/sync.ts` runs daily via `.github/workflows/sync.yml`. It pulls
upstream sources, merges into the existing registry preferring manual
entries, and commits back if there's a diff. To run it locally:

```bash
npm run sync          # writes
npm run sync -- --dry # no write
```

## Commit style

Conventional Commits. Examples:

- `feat(palette): keyboard navigate with j/k`
- `fix(card): truncate authors >50 chars`
- `chore(registry): add 4 new community servers`
- `docs(readme): clarify sync behavior`

## Code review checklist

- [ ] Types pass (`npm run typecheck`)
- [ ] Build passes (`npm run build`)
- [ ] No new external runtime dep added without discussion
- [ ] If you changed `servers.json`, the entry is sorted near similar peers
