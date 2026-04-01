## 2024-05-24 - Accessibility for separated input-groups
**Learning:** The custom `input-group` component separates visual text labels (using `<span>`) from `<input>` elements. This causes screen readers to lose context for inputs, especially when dynamically generated like in the fertilizer calculator.
**Action:** When using `input-group`, ensure explicit `aria-label` attributes are added for dynamic inputs, or convert static visual `<span>` labels to semantic `<label for="[id]">` tags to maintain screen reader context.
