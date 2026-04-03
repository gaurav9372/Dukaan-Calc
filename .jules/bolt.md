
## 2026-04-03 - Cached computed styles to avoid layout thrashing
**Learning:** Repeatedly calling `getComputedStyle` and doing DOM lookups (like `closest` and `querySelector`) in hot paths like keystroke handlers (`updateCaret`, `placeCaretFromEvent`) causes expensive layout thrashing and slows down typing responsiveness.
**Action:** Used `WeakMap` to cache computationally expensive layout properties like `font`, `paddingLeft`, `unitWidth`, and `group` lookup. Safely attached these to DOM nodes to prevent memory leaks, avoiding manual garbage collection and keeping the namespace clean. Also added an `invalidateCaches` listener for resize and orientation change events.
