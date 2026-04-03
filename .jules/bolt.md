## 2024-05-24 - Optimize dynamic list rendering
**Learning:** In vanilla JS apps, appending elements directly in loops causes expensive layout thrashing. DocumentFragments batch DOM operations.
**Action:** Use `document.createDocumentFragment()` to accumulate elements inside loops, and update the DOM efficiently using `element.replaceChildren(fragment)`.
