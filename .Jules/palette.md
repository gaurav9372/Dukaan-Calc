## 2026-03-26 - Physical Keyboard Support for Custom Keyboards
**Learning:** Custom on-screen keyboards with `readonly` and `inputmode="none"` completely disable physical keyboard input.
**Action:** To maintain desktop accessibility and allow users to type natively, a global `keydown` mapping is required to intercept physical keys and map them to the virtual keyboard logic.
