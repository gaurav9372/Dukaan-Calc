## 2026-03-28 - Detached visual labels in input-group
**Learning:** The custom `input-group` component structure often separates the visual text label from the actual `<input>` element, meaning screen readers miss the context (especially for dynamically generated inputs like product rows or result outputs).
**Action:** Always add explicit `aria-label` attributes to dynamically generated `<input>` elements, and ensure static visual `<span class="result-label">` tags are converted to semantic `<label for="[id]">` elements pointing to their respective inputs.
