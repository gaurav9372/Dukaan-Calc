## 2024-05-24 - Physical Keyboards and Custom Keyboards
**Learning:** Using `readonly` on input fields to prevent native mobile keyboards from appearing also inadvertently blocks physical desktop keyboards from typing. Screen readers and desktop users may experience frustration if there's no way to type manually.
**Action:** Always pair custom on-screen keyboards (and `readonly` or `inputmode="none"` inputs) with a global `keydown` event listener to capture physical keypresses for accessibility.
