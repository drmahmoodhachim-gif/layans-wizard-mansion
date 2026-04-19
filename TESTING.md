# Manual Testing Checklist

- [ ] Keyboard-only navigation: Tab through all controls, activate with Enter/Space.
- [ ] Escape closes settings panel.
- [ ] Screen reader labels announced for theme links, settings button, canvas controls.
- [ ] Mobile layout at 320px: no horizontal scroll; cards and game controls usable.
- [ ] localStorage persistence: smiles, badges, streaks, gallery survive refresh.
- [ ] Theme routing works with browser back button.
- [ ] prefers-reduced-motion disables floating smile animation.
- [ ] Offline behavior: visit once online, then disconnect and reload (service worker should serve app shell).
