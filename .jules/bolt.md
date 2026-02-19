## 2024-05-22 - [React Performance Anti-Pattern: Intl Instantiation in Render Loops]
**Learning:** High-frequency components like chart tooltips (which re-render on mouse move) were instantiating `Intl.NumberFormat` on every render. This is computationally expensive and causes jank.
**Action:** Always hoist `Intl.NumberFormat` instances outside of components or memoize them, especially in high-frequency render paths.
