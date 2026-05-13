/**
 * ZeroTools - URL Encoder & Decoder
 * File: js/tools/url-encoder.js
 */

(function () {
  const TOOL_ID = 'url-encoder';

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

  const modeRadios = document.querySelectorAll('input[name="mode"]');
  const submodeRadios = document.querySelectorAll('input[name="submode"]');

  // --- Utility Functions ---

  function escapeHtml(unsafe) {
    return (unsafe || '').toString()
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  // --- Core Processing Logic ---

  function parseUrlDetails(urlStr) {
    try {
      // Must have protocol to parse reliably, fallback for "//" or missing
      let parseTarget = urlStr;
      if (!/^https?:\/\//i.test(parseTarget)) {
        if (parseTarget.startsWith('//')) {
          parseTarget = 'http:' + parseTarget;
        } else {
           // We won't attempt full URL parse if it's just a raw path/query
           return null;
        }
      }

      const url = new URL(parseTarget);
      
      let paramsHtml = '';
      if (url.searchParams.size > 0) {
        paramsHtml += `
          <div style="margin-top: var(--space-4); margin-bottom: var(--space-2); font-weight: 600; color: var(--text-secondary); font-size: var(--text-xs); text-transform: uppercase; letter-spacing: 0.05em;">Query Parameters</div>
          <table style="width: 100%; border-collapse: collapse; font-size: var(--text-sm);">
            <tbody>
        `;
        url.searchParams.forEach((value, key) => {
          paramsHtml += `
            <tr style="border-bottom: 1px solid var(--border-subtle);">
              <td style="padding: 8px 8px 8px 0; color: var(--syntax-key); width: 30%; word-break: break-all;">${escapeHtml(key)}</td>
              <td style="padding: 8px 0 8px 8px; color: var(--syntax-string); word-break: break-all;">${escapeHtml(value)}</td>
            </tr>
          `;
        });
        paramsHtml += `</tbody></table>`;
      }

      return `
        <div style="margin-top: var(--space-6); padding-top: var(--space-4); border-top: 1px dashed var(--border-default);">
          <div style="margin-bottom: var(--space-3); font-family: var(--font-sans); font-weight: 600; color: var(--text-primary);">URL Breakdown</div>
          <table style="width: 100%; border-collapse: collapse; font-family: var(--font-mono); font-size: var(--text-sm);">
            <tbody>
              <tr style="border-bottom: 1px solid var(--border-subtle);"><td style="padding: 8px 8px 8px 0; color: var(--text-secondary); width: 120px;">Protocol</td><td style="padding: 8px 0 8px 8px; color: var(--text-primary);">${escapeHtml(url.protocol)}</td></tr>
              <tr style="border-bottom: 1px solid var(--border-subtle);"><td style="padding: 8px 8px 8px 0; color: var(--text-secondary);">Host</td><td style="padding: 8px 0 8px 8px; color: var(--text-primary);">${escapeHtml(url.hostname)}</td></tr>
              ${url.port ? `<tr style="border-bottom: 1px solid var(--border-subtle);"><td style="padding: 8px 8px 8px 0; color: var(--text-secondary);">Port</td><td style="padding: 8px 0 8px 8px; color: var(--syntax-number);">${escapeHtml(url.port)}</td></tr>` : ''}
              <tr style="border-bottom: 1px solid var(--border-subtle);"><td style="padding: 8px 8px 8px 0; color: var(--text-secondary);">Path</td><td style="padding: 8px 0 8px 8px; color: var(--text-primary);">${escapeHtml(url.pathname)}</td></tr>
              ${url.hash ? `<tr style="border-bottom: 1px solid var(--border-subtle);"><td style="padding: 8px 8px 8px 0; color: var(--text-secondary);">Hash</td><td style="padding: 8px 0 8px 8px; color: var(--text-primary);">${escapeHtml(url.hash)}</td></tr>` : ''}
            </tbody>
          </table>
          ${paramsHtml}
        </div>
      `;
    } catch (e) {
      return null;
    }
  }

  function parseQueryString(str) {
    // Only attempt if it looks like a pure query string starting with ? or contains &
    if (!str.startsWith('?') && !str.includes('&')) return null;
    
    // Don't double-parse if it's a full URL (the URL parser handles that)
    if (/^https?:\/\//i.test(str)) return null;

    try {
      const q = str.startsWith('?') ? str.substring(1) : str;
      const params = new URLSearchParams(q);
      
      if (params.size === 0) return null;

      let html = `
        <div style="margin-top: var(--space-6); padding-top: var(--space-4); border-top: 1px dashed var(--border-default);">
          <div style="margin-bottom: var(--space-3); font-family: var(--font-sans); font-weight: 600; color: var(--text-primary);">Query String Breakdown</div>
          <table style="width: 100%; border-collapse: collapse; font-family: var(--font-mono); font-size: var(--text-sm);">
            <tbody>
      `;
      
      params.forEach((value, key) => {
        html += `
          <tr style="border-bottom: 1px solid var(--border-subtle);">
            <td style="padding: 8px 8px 8px 0; color: var(--syntax-key); width: 30%; word-break: break-all;">${escapeHtml(key)}</td>
            <td style="padding: 8px 0 8px 8px; color: var(--syntax-string); word-break: break-all;">${escapeHtml(value)}</td>
          </tr>
        `;
      });
      html += `</tbody></table></div>`;
      return html;

    } catch (e) {
      return null;
    }
  }

  function processUrl() {
    if (!outputEl) return;
    
    const rawInput = inputEl.value;
    
    if (!rawInput) {
      outputEl.innerHTML = '<div style="color: var(--text-tertiary);">Result will appear here...</div>';
      outputEl.dataset.raw = '';
      if (statusEl) statusEl.innerHTML = '';
      return;
    }

    let mode = 'encode';
    modeRadios.forEach(r => { if (r.checked) mode = r.value; });

    let submode = 'component';
    submodeRadios.forEach(r => { if (r.checked) submode = r.value; });

    try {
      let result = '';
      
      if (mode === 'encode') {
        if (submode === 'component') {
          result = encodeURIComponent(rawInput);
        } else {
          result = encodeURI(rawInput);
        }
      } else {
        if (submode === 'component') {
          // Replace + with space before decoding component, common requirement
          result = decodeURIComponent(rawInput.replace(/\+/g, '%20'));
        } else {
          result = decodeURI(rawInput);
        }
      }

      let parsedExtrasHtml = '';
      
      // Attempt parsing on the raw input if decoding, or on the result if encoding (usually decoding is where parsing is desired)
      const targetForParse = mode === 'decode' ? result : rawInput;
      
      const parsedUrl = parseUrlDetails(targetForParse);
      if (parsedUrl) {
         parsedExtrasHtml = parsedUrl;
      } else {
         const parsedQuery = parseQueryString(targetForParse);
         if (parsedQuery) parsedExtrasHtml = parsedQuery;
      }

      outputEl.innerHTML = `<div style="word-break: break-all; user-select: all; font-size: var(--text-base);">${escapeHtml(result)}</div>${parsedExtrasHtml}`;
      outputEl.dataset.raw = result;

      if (statusEl) {
        statusEl.innerHTML = `<span style="color: var(--color-success);">✓ Success</span> <span style="color: var(--border-strong);">·</span> Length: ${result.length}`;
      }

      if (typeof window.saveToolInput === 'function') {
        window.saveToolInput(TOOL_ID, rawInput);
      }

    } catch (e) {
      outputEl.innerHTML = '';
      outputEl.dataset.raw = '';
      if (statusEl) {
        statusEl.innerHTML = `<span style="color: var(--color-error);">✗ Error: Invalid format for decoding</span>`;
      }
    }
  }

  // --- Event Listeners ---

  // Instant execution, no debounce needed for simple URI encoding
  if (inputEl) inputEl.addEventListener('input', processUrl);
  
  modeRadios.forEach(r => r.addEventListener('change', processUrl));
  submodeRadios.forEach(r => r.addEventListener('change', processUrl));

  if (btnRun) {
    btnRun.addEventListener('click', () => {
      processUrl();
      if (typeof window.trackToolUse === 'function') window.trackToolUse(TOOL_ID);
    });
  }

  if (btnClear) {
    btnClear.addEventListener('click', () => {
      if (inputEl) {
        inputEl.value = '';
        inputEl.focus();
      }
      if (outputEl) {
        outputEl.innerHTML = '<div style="color: var(--text-tertiary);">Result will appear here...</div>';
        outputEl.dataset.raw = '';
      }
      if (statusEl) statusEl.innerHTML = '';
      
      if (typeof window.saveToolInput === 'function') {
        window.saveToolInput(TOOL_ID, '');
      }
    });
  }

  if (btnPaste) {
    btnPaste.addEventListener('click', async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (inputEl) {
          inputEl.value = text;
          processUrl();
        }
      } catch (err) {
        if (typeof window.showToast === 'function') window.showToast('Clipboard permission denied.', 'error');
      }
    });
  }

  if (btnSample) {
    btnSample.addEventListener('click', () => {
      if (inputEl) {
        document.querySelector('input[name="mode"][value="decode"]').checked = true;
        document.querySelector('input[name="submode"][value="component"]').checked = true;
        inputEl.value = "https%3A%2F%2Fzerotools.dev%2Fsearch%3Fquery%3Dbase64%20encode%26category%3Dweb%23results";
        processUrl();
      }
    });
  }

  if (btnCopy) {
    btnCopy.addEventListener('click', () => {
      const rawOutput = outputEl ? outputEl.dataset.raw : '';
      if (!rawOutput) return;
      
      if (typeof window.copyToClipboard === 'function') {
        window.copyToClipboard(rawOutput, btnCopy);
      } else {
        navigator.clipboard.writeText(rawOutput);
      }
      
      if (typeof window.trackCopy === 'function') window.trackCopy(TOOL_ID);
    });
  }

  if (btnDownload) {
    btnDownload.addEventListener('click', () => {
      const rawOutput = outputEl ? outputEl.dataset.raw : '';
      if (!rawOutput) return;

      const blob = new Blob([rawOutput], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      
      a.href = url;
      a.download = `url-encoded-${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  function init() {
    if (typeof window.loadToolInput === 'function') {
      const savedInput = window.loadToolInput(TOOL_ID);
      if (savedInput && inputEl) {
        inputEl.value = savedInput;
        processUrl();
      }
    }
  }

  init();
})();