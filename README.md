# Password Generator

A privacy-first static password generator that runs entirely in the browser. It is built with semantic HTML, modern vanilla JavaScript, and lightweight responsive CSS for direct deployment on GitHub Pages.

## Features

- Generate random passwords locally on the client
- Adjustable password length slider
- Uppercase, lowercase, numbers, and special character controls
- Option to exclude similar-looking characters
- Optional custom characters input
- Copy button with Clipboard API support and manual fallback
- Lightweight strength indicator
- Dark and light mode with system preference detection and saved user override
- Mobile-first responsive layout

## Accessibility highlights

- Semantic HTML5 landmarks and clear heading structure
- Skip to main content link
- Explicit labels for all form controls
- Keyboard-friendly interactions and visible focus states
- Accessible live regions for copy and validation feedback
- Strong contrast in both light and dark themes
- Reduced motion support via `prefers-reduced-motion`

## SEO highlights

- Descriptive page title and meta description
- Canonical URL placeholder for GitHub Pages
- Open Graph and Twitter card metadata
- Robots meta tag
- Lightweight JSON-LD structured data for a `WebApplication`
- Clean, human-readable semantic page structure

## Local run instructions

1. Download or clone the repository.
2. Ensure these four files are in the project root:
   - `index.html`
   - `style.css`
   - `script.js`
   - `README.md`
3. Open `index.html` in a browser.

## GitHub Pages deployment

1. Create a repository named `password-generator`.
2. Add the four project files to the repository root and push to `main`.
3. In GitHub, open **Settings → Pages**.
4. Set the source to **Deploy from a branch**.
5. Choose the `main` branch and the `/root` folder.
6. Save the settings and wait for the site to publish.
7. Update the canonical and social URL placeholders in `index.html` to your final GitHub Pages URL.

## Privacy statement

Passwords are generated entirely in the browser and never leave the device. No backend, database, or password storage is used.
