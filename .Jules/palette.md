## 2024-05-18 - Semantic labels vs visual text for input groups
**Learning:** Visual text spans placed next to inputs in a `.input-group` component do not automatically provide accessible names to screen readers, leaving users without context for dynamic or result inputs.
**Action:** When creating new `.input-group` instances, always ensure a semantic `<label for="[id]">` is used for static elements, or an explicit `aria-label` is added to dynamic/unlabeled inputs.
