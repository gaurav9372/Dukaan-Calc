## 2024-04-03 - Optimize DOM Insertion with DocumentFragment
**Learning:** Using repeated `appendChild` in loops inside `renderProducts` caused layout thrashing and unnecessary reflows. Replacing `innerHTML = ""` and repeated `appendChild` calls with a `DocumentFragment` combined with `element.replaceChildren()` performs a single DOM update, dramatically improving render performance for lists.
**Action:** Always utilize `document.createDocumentFragment()` combined with `replaceChildren()` for bulk DOM updates rather than appending elements one by one or using `innerHTML`.
