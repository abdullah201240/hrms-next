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

## 2. Flat UI — no shadows, no rounded corners
- **No `box-shadow` anywhere**: never add `shadow`, `shadow-sm/md/lg/xl`, `drop-shadow`, or arbitrary `[box-shadow:...]` classes. The shadow scale is globally neutralized in `src/app/globals.css`.
- **No rounded corners anywhere**: never add `rounded`, `rounded-sm/md/lg/full`, etc. A global `border-radius: 0 !important` enforces square corners on every element.
- Do not override these with inline styles or `!important` utilities to reintroduce shadows/rounding.
- Borders (1px `border-*`) and focus rings are kept for structure/accessibility — the "flat" rule targets shadows and radii only.
- Rely on the shadcn theme tokens (background/foreground/border/muted) for hierarchy, not on shadows or rounded corners.

Any PR/new screen violating these is non-conforming and must be fixed.

## 3. After ANY `shadcn add` — re-flatten (MANDATORY)
- Newly added shadcn components ship with `rounded-*`/`shadow-*` classes again.
- Right after `npx shadcn@latest add <name>`, run: `npm run ui:flatten`
  (script: scripts/flatten-ui.mjs) — it strips those tokens from all src/components/ui/*.tsx.
- Then verify: `grep -rE "rounded-|shadow-|drop-shadow" src/components/ui` must return nothing, and `npm run build` must pass.
