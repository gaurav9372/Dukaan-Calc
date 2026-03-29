## 2026-03-29 - Custom Input Group Context Loss
**Learning:** The custom `input-group` component pattern (which visually groups an input with a unit or label but separates them in the DOM structure without explicit associations) causes screen reader context loss, especially for dynamically generated fields in grid layouts or static result displays.
**Action:** When using or creating custom input groups, always ensure that either a semantic `<label for="[id]">` exists, or an explicit `aria-label` attribute is added to the `<input>` element to maintain screen reader context.
