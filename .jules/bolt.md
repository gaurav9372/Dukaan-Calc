
## 2024-05-18 - Caching getComputedStyle and DOM lookups in Vanilla JS
**Learning:** Calling `getComputedStyle` and querying the DOM (`closest`, `querySelector`) continuously inside frequently fired events (like `input` or `pointerdown` -> `placeCaretFromEvent` / `updateCaret`) causes significant layout thrashing and blocks the main thread. In this codebase, the DOM cache pattern directly attaches these to the element itself (`_cachedGroup`, `_cachedFont`, etc.) and requires explicit `undefined` checks.
**Action:** When working on heavily interactive elements, attach static style calculations to the DOM nodes and implement an `invalidateCaches` function tied to `resize` and `orientationchange` to clear them instead of recalculating every time.
