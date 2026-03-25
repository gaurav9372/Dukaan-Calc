## 2024-05-18 - Physical Keyboard Support for Custom Keyboards
**Learning:** Custom on-screen keyboards often disable native physical keyboard support by setting `readonly` and `inputmode="none"`, creating a severe accessibility trap for desktop/physical keyboard users.
**Action:** Always implement a global `keydown` event listener to map physical key presses back to the internal key handling logic when overriding native input behaviors for custom keyboards.
