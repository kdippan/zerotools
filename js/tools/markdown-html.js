/**
 * ZeroTools - Markdown to HTML Converter
 * File: js/tools/markdown-html.js
 */

(function () {
  const TOOL_ID = 'markdown-html';

  // --- DOM Elements ---
  const mdInputEl = document.getElementById('md-input');
  const htmlPreviewEl = document.getElementById('html-preview');
  
  const viewPreviewBtn = document.getElementById('view-preview');
  const viewRawBtn = document.getElementById('view-raw');

  const optGfmEl = document.getElementById('opt-gfm');
  const optTablesEl = document.getElementById('opt-tables');
  const optBreaksEl = document.getElementById('opt-breaks');
  const optSanitizeEl = document.getElementById('opt-sanitize');

  const btnClear = document.getElementById('btn-clear');
  const btnPaste = document.getElementById('btn-paste');
  const btnSample = document.getElementById('btn-sample');
  const btnCopyHtml = document.getElementById('btn-copy-html');
  const btnDownload = document.getElementById('btn-download');

  const wordCountEl = document.getElementById('word-count');
  const charCountEl = document.getElementById('char-count');

  // --- State ---
  let currentView = 'preview'; // 'preview' or 'raw'
  let rawHtmlOutput = '';

  const SAMPLE_MARKDOWN = `# Welcome to ZeroTools Markdown

This is a real-time, client-side Markdown to HTML converter. 

## Features
* **100% Offline**: Your data never leaves the browser.
* **Instant Preview**: See your rendered HTML as you type.
* **Sanitized**: Optional DOMPurify integration prevents XSS.

### Code Example
\`\`\`javascript
function isAwesome(tool) {
  return tool === "ZeroTools";
}
\`\`\`

> "Simplicity is the ultimate sophistication." - Leonardo da Vinci

| Syntax | Description |
| ----------- | ----------- |
| Header | Title |
| Paragraph | Text |

[Visit ZeroTools](https://zerotools-io.vercel.app/) for more privacy-first utilities.`;

  // --- Core Processing Logic ---

  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  function escapeHtml(unsafe) {
    return (unsafe || '').toString()
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function getOptions() {
    return {
      gfm: optGfmEl ? optGfmEl.checked : true,
      breaks: optBreaksEl ? optBreaksEl.checked : true,
      sanitize: optSanitizeEl ? optSanitizeEl.checked : true
    };
  }

  function updateStats(text) {
    if (!wordCountEl || !charCountEl) return;
    const words = text.trim() ? text.trim().split(/\s+/).length : 0;
    const chars = text.length;
    wordCountEl.textContent = words;
    charCountEl.textContent = chars;
  }

  function processMarkdown() {
    if (!mdInputEl || !htmlPreviewEl) return;

    const mdText = mdInputEl.value;
    const opts = getOptions();

    updateStats(mdText);

    if (!mdText) {
      rawHtmlOutput = '';
      renderView();
      saveState();
      return;
    }

    try {
      // Configure Marked.js
      if (typeof marked !== 'undefined') {
        marked.setOptions({
          gfm: opts.gfm,
          breaks: opts.breaks
        });
        
        let dirtyHtml = marked.parse(mdText);

        // Configure DOMPurify
        if (opts.sanitize && typeof DOMPurify !== 'undefined') {
          rawHtmlOutput = DOMPurify.sanitize(dirtyHtml);
        } else {
          rawHtmlOutput = dirtyHtml;
        }

        renderView();
        saveState();
        
      } else {
        htmlPreviewEl.innerHTML = '<div style="color: var(--color-error); padding: 16px;">Error: marked.js library failed to load.</div>';
      }
    } catch (e) {
      console.error("Markdown parsing error:", e);
    }
  }

  function renderView() {
    if (!htmlPreviewEl) return;

    if (!rawHtmlOutput) {
       htmlPreviewEl.innerHTML = `<div style="color: var(--text-tertiary); font-family: var(--font-mono); font-size: var(--text-sm); padding: var(--space-4);">Rendered HTML preview will appear here...</div>`;
       return;
    }

    if (currentView === 'preview') {
      // Create a scoped container to prevent markdown styles from bleeding into the app UI
      htmlPreviewEl.innerHTML = `<div class="markdown-body" style="padding: var(--space-4); color: var(--text-primary); font-family: var(--font-sans); line-height: 1.6; word-break: break-word;">${rawHtmlOutput}</div>`;
      
      // Inject minimal CSS reset for the markdown body to look decent without a massive stylesheet
      const style = document.createElement('style');
      style.textContent = `
        .markdown-body h1, .markdown-body h2, .markdown-body h3 { font-weight: 600; margin-top: 1.5em; margin-bottom: 0.5em; line-height: 1.2; border-bottom: 1px solid var(--border-subtle); padding-bottom: 0.3em; }
        .markdown-body p { margin-bottom: 1em; }
        .markdown-body a { color: var(--accent); text-decoration: none; }
        .markdown-body a:hover { text-decoration: underline; }
        .markdown-body pre { background: var(--bg-primary); border: 1px solid var(--border-default); border-radius: var(--radius-sm); padding: 1em; overflow: auto; margin-bottom: 1em; }
        .markdown-body code { font-family: var(--font-mono); font-size: 0.9em; background: var(--bg-primary); padding: 0.2em 0.4em; border-radius: 3px; }
        .markdown-body pre code { padding: 0; background: transparent; }
        .markdown-body blockquote { border-left: 4px solid var(--border-strong); padding-left: 1em; margin-left: 0; color: var(--text-secondary); }
        .markdown-body ul, .markdown-body ol { margin-bottom: 1em; padding-left: 2em; }
        .markdown-body table { border-collapse: collapse; width: 100%; margin-bottom: 1em; }
        .markdown-body th, .markdown-body td { border: 1px solid var(--border-default); padding: 8px 12px; text-align: left; }
        .markdown-body th { background: var(--bg-elevated); }
        .markdown-body img { max-width: 100%; height: auto; }
      `;
      htmlPreviewEl.appendChild(style);

    } else {
      htmlPreviewEl.innerHTML = `<div style="padding: var(--space-4); font-family: var(--font-mono); font-size: var(--text-sm); color: var(--text-primary); white-space: pre-wrap; word-break: break-all;">${escapeHtml(rawHtmlOutput)}</div>`;
    }
  }

  function setViewMode(mode) {
    currentView = mode;
    if (mode === 'preview') {
      if (viewPreviewBtn) { viewPreviewBtn.classList.add('active'); viewPreviewBtn.style.color = 'var(--accent)'; viewPreviewBtn.style.borderBottomColor = 'var(--accent)'; }
      if (viewRawBtn) { viewRawBtn.classList.remove('active'); viewRawBtn.style.color = 'var(--text-secondary)'; viewRawBtn.style.borderBottomColor = 'transparent'; }
    } else {
      if (viewRawBtn) { viewRawBtn.classList.add('active'); viewRawBtn.style.color = 'var(--accent)'; viewRawBtn.style.borderBottomColor = 'var(--accent)'; }
      if (viewPreviewBtn) { viewPreviewBtn.classList.remove('active'); viewPreviewBtn.style.color = 'var(--text-secondary)'; viewPreviewBtn.style.borderBottomColor = 'transparent'; }
    }
    renderView();
  }

  // --- Event Listeners ---

  const debouncedProcess = debounce(processMarkdown, 200);

  if (mdInputEl) {
    mdInputEl.addEventListener('input', debouncedProcess);
  }

  [optGfmEl, optBreaksEl, optSanitizeEl].forEach(el => {
    if (el) el.addEventListener('change', processMarkdown);
  });

  if (viewPreviewBtn) viewPreviewBtn.addEventListener('click', () => setViewMode('preview'));
  if (viewRawBtn) viewRawBtn.addEventListener('click', () => setViewMode('raw'));

  if (btnClear) {
    btnClear.addEventListener('click', () => {
      if (mdInputEl) {
        mdInputEl.value = '';
        mdInputEl.focus();
      }
      processMarkdown();
    });
  }

  if (btnPaste) {
    btnPaste.addEventListener('click', async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (mdInputEl) {
          mdInputEl.value = text;
          processMarkdown();
        }
      } catch (err) {
        if (typeof window.showToast === 'function') window.showToast('Clipboard permission denied.', 'error');
      }
    });
  }

  if (btnSample) {
    btnSample.addEventListener('click', () => {
      if (mdInputEl) {
        mdInputEl.value = SAMPLE_MARKDOWN;
        processMarkdown();
      }
    });
  }

  if (btnCopyHtml) {
    btnCopyHtml.addEventListener('click', () => {
      if (!rawHtmlOutput) return;
      if (typeof window.copyToClipboard === 'function') {
        window.copyToClipboard(rawHtmlOutput, btnCopyHtml);
      } else {
        navigator.clipboard.writeText(rawHtmlOutput);
      }
      if (typeof window.trackCopy === 'function') window.trackCopy(TOOL_ID);
    });
  }

  if (btnDownload) {
    btnDownload.addEventListener('click', () => {
      if (!rawHtmlOutput) return;
      
      const fullHtmlDoc = `<!DOCTYPE html>\n<html lang="en">\n<head>\n<meta charset="UTF-8">\n<meta name="viewport" content="width=device-width, initial-scale=1.0">\n<title>Markdown Export</title>\n</head>\n<body>\n${rawHtmlOutput}\n</body>\n</html>`;

      const blob = new Blob([fullHtmlDoc], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `document-${Date.now()}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  // --- State Management ---

  function saveState() {
    if (typeof window.saveToolInput !== 'function') return;
    if (mdInputEl) window.saveToolInput(TOOL_ID + '-input', mdInputEl.value);
    
    const opts = getOptions();
    window.saveToolInput(TOOL_ID + '-options', JSON.stringify(opts));
  }

  function loadState() {
    if (typeof window.loadToolInput !== 'function') return false;
    
    const savedInput = window.loadToolInput(TOOL_ID + '-input');
    const savedOptions = window.loadToolInput(TOOL_ID + '-options');

    if (savedInput && mdInputEl) {
      mdInputEl.value = savedInput;
    }

    if (savedOptions) {
      try {
        const opts = JSON.parse(savedOptions);
        if (optGfmEl) optGfmEl.checked = opts.gfm;
        if (optBreaksEl) optBreaksEl.checked = opts.breaks;
        if (optSanitizeEl) optSanitizeEl.checked = opts.sanitize;
      } catch (e) {
        // silent fail on bad JSON parse
      }
    }
    
    return savedInput !== null;
  }

  function init() {
    setViewMode('preview');
    if (!loadState()) {
       // If no state, leave empty
    } else {
       processMarkdown();
    }
  }

  // Ensure libraries are ready before initial parse if loaded via defer
  if (document.readyState === 'complete') {
    init();
  } else {
    window.addEventListener('load', init);
  }

})();