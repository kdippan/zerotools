# ZeroTools 🧰

> Privacy-first, zero-dependency developer utilities that run entirely in your browser.

[![Live Demo](https://img.shields.io/badge/Live_Demo-zerotools--io.vercel.app-00dc82?style=for-the-badge)](https://zerotools-io.vercel.app/)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

**ZeroTools** is a collection of 25+ essential developer tools designed with a singular focus: **absolute privacy and zero latency**. Every tool executes 100% client-side using Vanilla JavaScript. No data is ever sent to a backend server. 

If you are tired of slow, ad-bloated online formatters that quietly upload your proprietary code to an unknown server, ZeroTools is built for you.

---

## ⚡ Why ZeroTools?

1. **🔒 100% Privacy:** All processing happens directly in your browser's memory. We don't have a backend. We don't want your data.
2. **🚀 Zero Latency:** No API calls, no network round-trips. Conversions and generations happen instantly as you type.
3. **🛠️ Zero Dependencies:** Built strictly with Vanilla HTML5, CSS3, and ES6 JavaScript. No React, no build steps, no bloat.
4. **🎨 Terminal Minimal Aesthetic:** Designed for developers. Dark mode by default, monospace data presentation, and a clean, distraction-free UI.

---

## 🛠️ The Toolkit

ZeroTools provides 25 utilities categorized for quick access:

| Tool Name | Category | Description |
| :--- | :--- | :--- |
| **JSON Formatter** | Formatters | Beautify, minify, and validate JSON payloads. |
| **Base64 Encoder** | Encoders | Encode/decode plain text or URL-safe strings. |
| **UUID Generator** | Generators | Generate random v4, v1, v7, NanoID, or CUID2 IDs in bulk. |
| **Regex Tester** | Text | Test pattern matching logic interactively. |
| **Hash Generator** | Security | Generate MD5, SHA-1, SHA-256, and SHA-512 hashes. |
| **URL Encoder** | Encoders | Safely encode or decode complex URL parameters. |
| **JWT Decoder** | Security | Decode and inspect JWT tokens instantly. |
| **Timestamp Converter** | Converters | Convert Unix epoch numbers to human-readable dates. |
| **Password Generator** | Security | Generate strong, cryptographically secure passwords. |
| **Color Picker** | Converters | Select colors visually and check WCAG contrast. |
| **Markdown to HTML** | Formatters | Draft page copy and export clean HTML. |
| **Lorem Ipsum** | Generators | Generate placeholder text with dev/hipster variants. |
| **QR Code Generator** | Generators | Create downloadable QR codes instantly. |
| **Diff Checker** | Text | Compare original and modified text side-by-side. |
| **Word Counter** | Text | Analyze character limits and keyword density. |
| **Image to Base64** | Encoders | Convert SVGs and PNGs to inline data URIs. |
| **Number Converter** | Converters | Convert between Hex, Binary, Octal, and Decimal formats. |
| **HTML Entity Encoder**| Encoders | Safely escape symbols for HTML attributes. |
| **CSS Minifier** | Formatters | Compress entire stylesheets instantly offline. |
| **Chmod Calculator** | Converters | Calculate Linux file permissions (octal/symbolic). |
| **SVG Optimizer** | Formatters | Clean and compress raw SVG code to save space. |
| **Cron Generator** | Generators | Build complex cron job schedules visually. |
| **Meta Tag Gen** | Web | Generate secure HTML header meta tags with previews. |
| **Color Converter** | Converters | Convert HEX to RGB, HSL, OKLCH, HSV, and CMYK. |
| **JSON to CSV** | Formatters | Transform JSON array payloads into Excel-ready data tables. |

---

## 💻 Tech Stack

This project is an exercise in building a robust, production-ready application without modern framework overhead.

* **Core:** Vanilla HTML5, CSS3 (using native variables), ES6 JavaScript.
* **Hosting:** Deployed via [Vercel](https://vercel.com).
* **Search Engine:** Powered by [Fuse.js](https://fusejs.io/) (loaded via CDN) for rapid client-side fuzzy search.
* **Styling:** Custom "Terminal Minimal" design system. No Tailwind, no Bootstrap.
* **Typography:** [Geist](https://vercel.com/font) (UI elements) and IBM Plex Mono (Code/Data representation).

---

## 🚀 Getting Started (Local Development)

Because ZeroTools relies on no build tools or package managers, running it locally is incredibly simple.

### Prerequisites
You just need a way to serve static files locally. 

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/kdippan/zerotools.git
   cd zerotools