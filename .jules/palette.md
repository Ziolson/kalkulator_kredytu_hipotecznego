# Palette's Journal

## 2024-05-23 - Accessibility of Custom Radio Groups
**Learning:** Custom `div`-based radio groups (like the Strategy Selector) require explicit `role="radiogroup"`/`role="radio"`, `tabIndex`, and `onKeyDown` handlers for basic keyboard accessibility. While implementing Enter/Space selection makes them usable, full WAI-ARIA compliance (arrow key navigation, roving tabindex) is complex to implement manually.
**Action:** For future components, prefer native `<input type="radio">` with custom styling (using `appearance-none` or `peer` classes) to get free, standard keyboard behavior and focus management. If using custom divs, ensure at least `tabIndex` and `Enter/Space` support are added.

## 2024-05-23 - Environment Workarounds
**Learning:** In environments with restricted network access for `npm`/`pnpm`, `bun install` can successfully fetch dependencies. However, it generates a `bun.lock` file which must be removed before submission to avoid polluting the repo if `pnpm` is the standard.
**Action:** Use `bun` for local dev setup if needed, but clean up artifacts.
