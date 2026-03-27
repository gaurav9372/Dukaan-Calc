## 2024-03-27 - Desktop Accessibility with Custom Keyboards
**Learning:** Using `readonly` and `inputmode="none"` to force a custom on-screen keyboard completely breaks native physical keyboard support for desktop users, violating basic accessibility expectations.
**Action:** When implementing custom numpads/keyboards for web apps, always bind a global `keydown` listener to map physical key presses (0-9, Backspace, Enter, etc.) to the internal virtual key handling logic.
