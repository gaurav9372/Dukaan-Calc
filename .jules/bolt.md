## 2025-02-18 - Optimized renderProducts loop
**Learning:** Using `innerHTML = ''` and repeated `appendChild()` operations in a loop within `renderProducts` in vanilla JS leads to inefficient DOM updates and layout thrashing, particularly since the `productList` interacts with dynamically sizing components.
**Action:** Always prefer using `document.createDocumentFragment()` inside loops to batch DOM creations in memory, and use `element.replaceChildren(fragment)` for atomic, performant DOM updates without XSS vulnerabilities, ensuring smoother rendering.
