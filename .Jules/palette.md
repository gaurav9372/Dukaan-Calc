## 2024-05-20 - Custom Keyboards Break Physical Input
**Learning:** When creating a custom on-screen keyboard for mobile users by setting inputs to `readonly` and `inputmode="none"`, physical keyboard input is entirely disabled for desktop users. This creates a severe accessibility issue where users cannot type numbers using their physical keyboard.
**Action:** Always pair custom on-screen keyboards with global `keydown` event listeners that map physical key presses to the application's internal key handling logic to maintain desktop accessibility.
