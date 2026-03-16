# Password Generator

A privacy-first, fully client-side random password generator built with vanilla HTML, CSS, and JavaScript. Deployed on GitHub Pages with no backend, no framework, and no build step.

Live site → [iamyvj.github.io/password-generator](https://iamyvj.github.io/password-generator/)

---

## Features

### Core
- Generate cryptographically random passwords using the Web Crypto API (`crypto.getRandomValues`)
- Adjustable length slider (8–64 characters)
- Toggle uppercase letters, lowercase letters, numbers, and symbols individually
- Exclude visually similar characters (O, 0, o, I, l, 1, |)
- Optional custom character input merged into the generation pool
- Copy to clipboard with Clipboard API and a manual fallback
- Lightweight password strength indicator

### UI & Experience
- Full-viewport landing page with hero, three info cards, and an animated scroll CTA
- DM Serif Display editorial serif for headings; Plus Jakarta Sans for body text
- Dark and light theme toggle with system preference detection and `localStorage` persistence
- Smooth scroll to the generator section
- Strength bar with animated fill transitions

### Privacy
- All generation logic runs in the browser — no server, no API, no storage
- Nothing is logged, transmitted, or persisted beyond the current tab

---

## Tech stack

| Layer | Choice |
|---|---|
| Markup | Semantic HTML5 |
| Styles | Vanilla CSS with custom properties |
| Logic | Vanilla ES6+ JavaScript (IIFE, no modules) |
| Fonts | Google Fonts (DM Serif Display + Plus Jakarta Sans) |
| Hosting | GitHub Pages |
| Dependencies | None |