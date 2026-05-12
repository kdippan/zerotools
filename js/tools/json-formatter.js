/**
 * ZeroTools - JSON Formatter & Validator
 * File: js/tools/json-formatter.js
 */

(function () {
  // --- DOM Elements ---
  const inputEl = document.getElementById('input');
  const outputEl = document.getElementById('output');
  const statusEl = document.getElementById('status');
  
  const btnRun = document.getElementById('btn-run');
  const btnClear = document.getElementById('btn-clear');
  const btnPaste = document.getElementById('btn-paste');
  const btnSample = document.getElementById('btn-sample');
  const btnCopy = document.getElementById('btn-copy');
  const btnDownload = document.getElementById('btn-download');
  
  // Options (Assuming standard form inputs will be in the HTML)
  const modeRadios = document.querySelectorAll('input[name="mode"]');
  const indentSelect = document.getElementById('indent-select');

  // --- Constants & Defaults ---
  const TOOL_ID = 'json-formatter';
  const SAMPLE_DATA = {
    "name": "zero-tools",
    "version": "1.0.0",
    "description": "Privacy-first developer utilities",
    "private": true,
    "scripts": {
      "start": "serve .",
      "test": "echo \"Error: no test specified\" && exit 1"
    },
    "repository": {
      "type": "git",
      "url": "https://github.com/kdippan/zerotools.git"
    },
    "author": "Dippan Bhusal",
    "license": "MIT",
    "isAwesome": true,
    "knownBugs": null,
    "supportedFormats": ["JSON", "Base64", "Markdown", "SVG"],
    "settings": {
      "theme": "terminal-minimal",
      "maxItems": 1000,
      "timeoutMs": 300
    }
  };

  // --- Utility Functions ---

  // Simple debounce helper
  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  // Count total keys in a nested object
  function countKeys(obj) {
    let count = 0;
    for (let key in obj) {
      if (obj.hasOwnProperty(key)) {
        count++;
        if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
          count += countKeys(obj[key]);
        }
      }
    }
    return count;
  }

  // Custom regex-based syntax highlighter mapped to our CSS variables
  function syntaxHighlight(jsonStr) {
    let formatted = jsonStr.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
    return formatted.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
      let cssVar = '--syntax-number';
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          cssVar = '--syntax-key';
          // Strip the colon, color the key, and append colon outside
          return `<span style="color: var(${cssVar});">${match.slice(0, -1)}</span>:`;
        } else {
          cssVar = '--syntax-string';
        }
      } else if (/true|false/.test(match)) {
        cssVar = '--syntax-bool';
      } else if (/null/.test(match)) {
        cssVar = '--syntax-null';
      }
      return `<span style="color: var(${cssVar});">${match}</span>`;
    });
  }

  // Extract approximate line number from native JSON parse error
  function extractErrorLine(errMsg) {
    const positionMatch = errMsg.match(/position (\d+)/);
    if (positionMatch && inputEl.value) {
      const pos = parseInt(positionMatch[1], 10);
      const lines = inputEl.value.substring(0, pos).split('\n');
      return lines.length;
    }
    return '?';
  }

  // Format bytes to human-readable size
  function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // --- Core Processing Logic ---

  function processJSON() {
    const rawInput = inputEl.value.trim();
    
    if (!rawInput) {
      outputEl.innerHTML = '';
      statusEl.innerHTML = '';
      return;
    }

    try {
      // 1. Validate & Parse
      const parsedData = JSON.parse(rawInput);
      
      // 2. Determine options
      let mode = 'format';
      modeRadios.forEach(r => { if (r.checked) mode = r.value; });
      
      let indentStr = '  '; // default 2 spaces
      if (indentSelect) {
        if (indentSelect.value === '4') indentStr = '    ';
        if (indentSelect.value === 'tab') indentStr = '\t';
      }

      // 3. Process
      let resultString = '';
      if (mode === 'minify') {
        resultString = JSON.stringify(parsedData);
      } else {
        resultString = JSON.stringify(parsedData, null, indentStr);
      }

      // 4. Highlight & Output
      outputEl.innerHTML = syntaxHighlight(resultString);
      outputEl.dataset.raw = resultString; // Store raw text for copying/downloading

      // 5. Update Status Bar
      const keyCount = countKeys(parsedData);
      const charCount = resultString.length;
      const byteSize = new Blob([resultString]).size;
      
      statusEl.innerHTML = `<span style="color: var(--color-success);">✓ Valid JSON</span> <span style="color: var(--border-strong);">·</span> ${keyCount} keys <span style="color: var(--border-strong);">·</span> ${charCount.toLocaleString()} chars <span style="color: var(--border-strong);">·</span> ${formatBytes(byteSize)}`;
      statusEl.style.color = 'var(--text-tertiary)';

      // Save valid input
      if (typeof window.saveToolInput === 'function') {
        window.saveToolInput(TOOL_ID, rawInput);
      }

    } catch (e) {
      // Handle Error
      const lineNum = extractErrorLine(e.message);
      outputEl.innerHTML = `<span style="color: var(--color-error);">Invalid JSON format. Please check your syntax.</span>`;
      outputEl.dataset.raw = '';
      statusEl.innerHTML = `<span style="color: var(--color-error);">✗ Error at line ${lineNum}: ${e.message}</span>`;
    }
  }

  // --- Event Listeners ---

  // Live validation on typing
  inputEl.addEventListener('input', debounce(processJSON, 300));

  // Options change triggering re-process
  if (indentSelect) {
    indentSelect.addEventListener('change', processJSON);
  }
  modeRadios.forEach(r => r.addEventListener('change', processJSON));

  // Run Button (Force process & track event)
  if (btnRun) {
    btnRun.addEventListener('click', () => {
      processJSON();
      if (typeof window.trackToolUse === 'function') window.trackToolUse(TOOL_ID);
    });
  }

  // Clear Button
  if (btnClear) {
    btnClear.addEventListener('click', () => {
      inputEl.value = '';
      outputEl.innerHTML = '';
      outputEl.dataset.raw = '';
      statusEl.innerHTML = '';
      inputEl.focus();
      if (typeof window.saveToolInput === 'function') window.saveToolInput(TOOL_ID, '');
    });
  }

  // Paste Button
  if (btnPaste) {
    btnPaste.addEventListener('click', async () => {
      try {
        const text = await navigator.clipboard.readText();
        inputEl.value = text;
        processJSON();
      } catch (err) {
        if (typeof window.showToast === 'function') {
          window.showToast('Clipboard permission denied.', 'error');
        }
      }
    });
  }

  // Load Sample Button
  if (btnSample) {
    btnSample.addEventListener('click', () => {
      inputEl.value = JSON.stringify(SAMPLE_DATA, null, 2);
      processJSON();
    });
  }

  // Copy Output Button
  if (btnCopy) {
    btnCopy.addEventListener('click', () => {
      const rawOutput = outputEl.dataset.raw;
      if (!rawOutput) return;
      
      if (typeof window.copyToClipboard === 'function') {
        window.copyToClipboard(rawOutput, btnCopy);
      } else {
        navigator.clipboard.writeText(rawOutput); // Fallback
      }
      
      if (typeof window.trackCopy === 'function') window.trackCopy(TOOL_ID);
    });
  }

  // Download Output Button
  if (btnDownload) {
    btnDownload.addEventListener('click', () => {
      const rawOutput = outputEl.dataset.raw;
      if (!rawOutput) return;

      const blob = new Blob([rawOutput], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      
      a.href = url;
      a.download = `formatted-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  // --- Initialization ---
  function init() {
    if (typeof window.loadToolInput === 'function') {
      const savedInput = window.loadToolInput(TOOL_ID);
      if (savedInput) {
        inputEl.value = savedInput;
        processJSON();
      }
    }
  }

  // Boot up
  init();

})();