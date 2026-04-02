## 2024-04-02 - Keyboard Focus States
**Learning:** The app's interactive elements (buttons, custom menu cards, reset buttons) completely lack keyboard focus indicators. The stylesheet disables `outline` globally and doesn't add it back for `:focus-visible`, making keyboard navigation impossible for screen reader and keyboard-only users.
**Action:** Always add `:focus-visible` outline rules for interactive elements to ensure accessibility.
