## 2024-06-25 - Prevent Layout Thrashing in Dynamic List Rendering
**Learning:** Appending items directly to the DOM (`element.appendChild()`) in a loop, or combining it with `element.innerHTML = ""`, causes layout thrashing and unnecessary browser repaints/reflows.
**Action:** Use `document.createDocumentFragment()` to accumulate elements inside the loop, and `element.replaceChildren(fragment)` after the loop, completing all node additions and screen clearing in a single efficient DOM operation.
