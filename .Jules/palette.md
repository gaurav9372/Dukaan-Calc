## 2024-05-24 - Accessibility of Custom On-Screen Keyboards
**Learning:** When implementing custom on-screen keyboards for specific input formats using `readonly` and `inputmode="none"`, physical keyboard input is entirely disabled by the browser for those elements. This completely breaks accessibility and usability for desktop users who expect to be able to type naturally.
**Action:** Always map physical keydown events (e.g., globally or on the inputs themselves) back to the internal key handling logic to ensure feature parity between touch and physical inputs.
