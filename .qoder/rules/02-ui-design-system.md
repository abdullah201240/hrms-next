---
trigger: always_on
---

# UI Rules — shadcn-only + Soft Design System

## 1. Only shadcn/ui components
- Every UI element MUST be a shadcn/ui component from `src/components/ui/` (add more via `npx shadcn@latest add <name>`).
- Do NOT introduce any other UI library (MUI, Chakra, HeroUI, daisyUI, raw Bootstrap/Tailwind plugins, etc.).
- Do NOT hand-roll bespoke widgets/buttons when a shadcn component exists. Compose shadcn primitives instead.
- Custom components are allowed ONLY as thin compositions of shadcn primitives; they must reuse shadcn primitives + the shared theme tokens below.
- The whole site must therefore share one identical look (same components, same tokens).

## 2. Soft UI — rounded corners, soft shadows, light borders
The product direction (approved by the user, matching the reference mockups) is a rounded, airy, softly-shadowed surface system. This REPLACES the old flat/borderless policy.
- **Radius is driven by the `--radius` token** in `src/app/globals.css` (currently `0.75rem`). The full `--radius-sm/md/lg/xl/2xl` scale derives from it.
- **Corners are re-applied centrally** via a `@layer base` "SOFT UI GLOBAL SYSTEM" block in `src/app/globals.css` keyed on shadcn `[data-slot="..."]` hooks (card, button, input, textarea, select-trigger, combobox-trigger, checkbox, switch, badge, avatar, dialog/sheet/select/dropdown/popover/command/calendar content + their items, tabs, table-container/table-head, sidebar-menu-button). This is because a previous flatten pass stripped the `rounded-*` tokens from component source, so radius lives in that one global block, not in each primitive.
- **Cards** (`[data-slot="card"]`) get `border-radius: var(--radius-xl)` + a soft two-layer `box-shadow`. Page `--background` is a light gray tint so white `bg-card` panels read as elevated surfaces.
- **Form controls** keep their own `border border-input` from source (the global `border-width: 0 !important` override has been REMOVED) and receive `var(--radius-md)` from the global block.
- **Pills/badges** use `var(--radius-md)`; **avatars** and `.pill`/`.bar-track` helpers are circular (`9999px`); **icon chips** on bespoke pages use the `.chip` helper (`var(--radius-md)`).
- **Tables**: `[data-slot="table-container"]` is rounded; `[data-slot="table-head"]` gets a light `--muted` background. Row separators come from the primitives' own `border-b`.
- Do NOT reintroduce the flat overrides. Do NOT add `rounded-*`/`shadow-*` utility classes ad hoc to primitives — put shared treatment in the global `[data-slot]` block so the whole site stays consistent.
- Focus rings stay for accessibility.

## 3. After `shadcn add`
- New shadcn components ship their own `rounded-*`/`shadow-*`/`border-*` tokens — that is now FINE and desired; do NOT run `npm run ui:flatten` or `scripts/strip-borders.mjs` (they are obsolete leftovers from the flat era and would break this system).
- If a newly added component's `[data-slot]` needs the soft treatment, add a selector to the SOFT UI block in `globals.css` rather than editing the component.
- Verify with `npm run build`.

## 4. Semantic/status pills
- Status/semantic pills use a background tint (`bg-emerald-50 text-emerald-700`, etc.) with `var(--radius-md)` rounding.

## 5. Dropdowns — always use the shared `SearchSelect` (MANDATORY)
- Every picker/dropdown in forms and tools MUST use `SearchSelect` from `src/components/shared/search-select.tsx` — a thin composition of the shadcn Base UI `Combobox` that gives every dropdown the SAME look and behavior: type-to-filter search, a clear (✕) button, a "No matches found." empty state, and an optional `+ Add {Doctype}` quick-create (pass `addLabel`).
- Do NOT use the plain shadcn `Select` for record/option pickers. `SearchSelect` props: `value`, `onChange(v: string)`, `options: readonly string[]`, `placeholder?`, `addLabel?` (enables quick-create), `id?`, `className?` (default `w-full`; e.g. `w-40`, `w-56`).
- Base UI ships NO default filter — `SearchSelect` already bakes in a case-insensitive substring `filter`. If you ever wrap `Combobox` directly, you MUST pass a `filter` or the list will not search.
- Only exception: the compact "Rows" page-size control in `src/components/shared/data-table.tsx` stays a plain `Select` (a search box would clutter every list page footer).
- Existing users: `/employees/new`, `/expenses/new`, `/leave/apply`, `/attendance/shift-assignment-tool`, `/attendance/mark-attendance`, `/payroll/bulk-assignment`, `/payroll/processing`, `/settings`.
