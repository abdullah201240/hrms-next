---
trigger: always_on
---

# UI Rules — shadcn-only + Flat Design

## 1. Only shadcn/ui components
- Every UI element MUST be a shadcn/ui component from `src/components/ui/` (add more via `npx shadcn@latest add <name>`).
- Do NOT introduce any other UI library (MUI, Chakra, HeroUI, daisyUI, raw Bootstrap/Tailwind plugins, etc.).
- Do NOT hand-roll bespoke widgets/buttons when a shadcn component exists. Compose shadcn primitives instead.
- Custom components are allowed ONLY as thin compositions of shadcn primitives; they must reuse shadcn primitives + the shared theme tokens below.
- The whole site must therefore share one identical look (same components, same tokens).

## 2. Flat UI — no shadows, no rounded corners, NO borders
- **No `box-shadow` anywhere**: never add `shadow`, `shadow-sm/md/lg/xl`, `drop-shadow`, or arbitrary `[box-shadow:...]` classes. The shadow scale is globally neutralized in `src/app/globals.css`.
- **No rounded corners anywhere**: never add `rounded`, `rounded-sm/md/lg/full`, etc. A global `border-radius: 0 !important` enforces square corners on every element.
- **No borders anywhere**: never add `border`, `border-*`, `divide-x`, `divide-y`, or `ring` used as a visible outline. A global `border-width: 0 !important` in `src/app/globals.css` removes every 1px line, and `[data-slot="separator"]` is made transparent. The `Card` primitive has its `ring-1` outline removed.
- Do not override these with inline styles or `!important` utilities to reintroduce shadows/rounding/borders.
- **Focus rings are the ONE exception** and must stay for accessibility (keyboard `:focus-visible` uses `--tw-ring-shadow`/`outline`, which are NOT affected by `border-width: 0`).
- Since there are no lines or shadows, hierarchy/structure comes ONLY from spacing plus a light background tint (page `--background` is a subtle gray so white `bg-card` surfaces remain distinguishable). Rely on background contrast, never on borders.

Any PR/new screen violating these is non-conforming and must be fixed.

## 3. After ANY `shadcn add` — re-flatten (MANDATORY)
- Newly added shadcn components ship with `rounded-*`/`shadow-*` classes again.
- Right after `npx shadcn@latest add <name>`, run: `npm run ui:flatten`
  (script: scripts/flatten-ui.mjs) — it strips those tokens from all src/components/ui/*.tsx.
- Then verify: `grep -rE "rounded-|shadow-|drop-shadow" src/components/ui` must return nothing, and `npm run build` must pass.

## 4. After ANY `shadcn add` — also strip borders
- New shadcn components also ship `border-*`/`divide-*` classes. The global `border-width: 0 !important` already hides them visually, but to keep source conforming run `node scripts/strip-borders.mjs` over app/shared pages when you hand-write new screens.
- Status/semantic pills use background tint (`bg-emerald-50`, etc.) instead of colored borders.
