## 2024-05-24 - Physical Keyboard Support for Custom On-Screen Keyboards
**Learning:** When building custom on-screen keyboards (e.g., using `readonly` and `inputmode="none"` inputs), desktop/external keyboard users are completely blocked from inputting data if only pointer events are handled.
**Action:** Always add a global `keydown` listener to map physical keystrokes (digits, backspace, enter, escape) to the same input handler used by the custom on-screen keyboard to ensure accessibility across device types.
