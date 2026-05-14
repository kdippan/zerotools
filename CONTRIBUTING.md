# Contributing to ZeroTools 🧰

First off, thank you for considering contributing to ZeroTools! Our goal is to build the fastest, most private, and most beautiful developer utilities on the web. 

**Live Environment:** [https://zerotools-io.vercel.app](https://zerotools-io.vercel.app)

To maintain our core philosophy and performance, we have a strict set of technical constraints. Please read them carefully before opening a PR.

## 🛑 The "Zero" Philosophy (Strict Constraints)

1. **Zero Frameworks:** No React, Vue, Svelte, Tailwind, Bootstrap, or jQuery. 
2. **Zero Build Tools:** No Node.js, npm, Webpack, Vite, or Babel. The code you write must run directly in the browser.
3. **Zero Servers:** Everything must be 100% client-side. No `fetch()` to external APIs unless explicitly approved for a specific tool (and never for data processing).
4. **Zero Deviations in Design:** Use the provided CSS variables (`var(--bg-primary)`, `var(--accent)`, etc.) located in `css/main.css`. Do not hardcode colors.

## 📁 Asset Management
All core visual assets must remain in the exact root `assets/` folder. Do not create nested asset directories.
* **Favicon:** `assets/favicon.svg`
* **Brand Logo:** `assets/logo.svg`
* **Social Sharing:** `assets/og-image.png` (Must be 1200x630)

## 🛠️ How to Add a New Tool

1. **Create the HTML:** Duplicate an existing tool HTML file (e.g., `tools/base64.html`) and update the meta tags, title, and UI structure. Ensure it extends the base layout and points correctly to `../assets/favicon.svg`.
2. **Create the JS:** Add your logic to `js/tools/your-tool.js`. Wrap it in an IIFE `(function() { ... })();` to avoid polluting the global scope.
3. **Register the Tool:** Open `js/tool-registry.js` and add your tool to the `TOOLS` array so it appears in the global search and homepage grid.
4. **Add CDNs (If needed):** If your tool requires a complex library (e.g., Markdown parsing, Hashing), use a trusted CDN (cdnjs) via `<script>` tags. **Do not bundle it.**
5. **Analytics & Storage:** Ensure you wire up `window.trackToolUse()` for major actions and utilize `window.saveToolInput()` to cache state locally.

## 🚀 Pull Request Process

1. Fork the repo and create your branch from `main`.
2. Name your branch descriptively: `add/yaml-formatter` or `fix/regex-tester-ui`.
3. Test your code locally (e.g., `python -m http.server 8000`). Verify changes against the live environment logic if needed.
4. Ensure the design matches the "Terminal Minimal" aesthetic (Geist + IBM Plex Mono, dark mode compatibility).
5. Open a Pull Request using the provided template.

Thank you for helping keep developer tools fast, free, and private.
