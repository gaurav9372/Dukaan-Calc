## 2024-05-18 - DocumentFragment for batching DOM Updates
**Learning:** Rendering dynamic lists inside vanilla JS by clearing `innerHTML` and looping `appendChild` triggers continuous layout thrashing and raises potential XSS risks.
**Action:** Use `document.createDocumentFragment()` to accumulate new elements inside the loop in memory, and perform a single update using `element.replaceChildren(fragment)` which is safer, clears children efficiently without `innerHTML = ""`, and significantly reduces reflows.
