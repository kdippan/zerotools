# Security Policy

ZeroTools is committed to providing utilities that respect developer privacy. Because our application is 100% client-side, the risk profile is significantly different from traditional server-backed applications.

## Supported Versions

Currently, the `main` branch deployed to Vercel/GitHub Pages is the only supported version.

## Architecture & Threat Model

Since ZeroTools has **no backend database, no user accounts, and no server-side processing**, traditional vulnerabilities (SQLi, Server-Side RCE, Data Breaches) do not apply. 

The primary security vectors we monitor are:
1. **Cross-Site Scripting (XSS):** Ensuring tools that render output (like the Markdown to HTML converter or HTML Entity Decoder) properly sanitize malicious payloads using DOMPurify.
2. **Regular Expression Denial of Service (ReDoS):** Ensuring our Regex Tester and CSS Minifier don't lock up the main thread when given extremely complex or malicious patterns.
3. **Supply Chain Attacks:** Monitoring the integrity of the specific versions of the CDN libraries we import (e.g., `highlight.js`, `crypto-js`).

## Reporting a Vulnerability

If you discover a security vulnerability—specifically a way to execute malicious scripts, bypass the client-side sandbox, or force unintended external network requests—please do not report it on the public issue tracker.

Instead, please email the project owner directly:
**dippan.connect@gmail.com**

Please include:
* A description of the vulnerability.
* The specific tool affected (e.g., `/tools/markdown-html`).
* Steps or a payload to reproduce the issue.

We will acknowledge receipt of your vulnerability report within 48 hours and strive to issue a patch as quickly as possible.
