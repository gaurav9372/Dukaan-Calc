## $(date +%Y-%m-%d) - DOM Caching to Eliminate Layout Thrashing
**Learning:** Managing a custom caret position via Canvas in this application forces repeated and expensive `getComputedStyle` and `closest` element lookups on every single keypress, leading to layout thrashing.
**Action:** Use DOM caching to store static computed styles and DOM references (like `paddingLeft` and `.input-group` elements) directly on the node using properties like `_cachedFont`, ensuring to invalidate the cache with a function triggered on `resize` and `orientationchange` events.
