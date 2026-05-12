(function () {
  const TOOL_ID = 'regex-tester';
  
  const inputEl = document.getElementById('input');
  const outputEl = document.getElementById('output');
  const statusEl = document.getElementById('status');
  
  const patternEl = document.getElementById('regex-pattern');
  const flagEls = {
    g: document.getElementById('flag-g'),
    i: document.getElementById('flag-i'),
    m: document.getElementById('flag-m'),
    s: document.getElementById('flag-s'),
    u: document.getElementById('flag-u'),
    y: document.getElementById('flag-y')
  };
  const presetSelect = document.getElementById('preset-select');

  const btnRun = document.getElementById('btn-run');
  const btnClear = document.getElementById('btn-clear');
  const btnPaste = document.getElementById('btn-paste');
  const btnSample = document.getElementById('btn-sample');
  const btnCopy = document.getElementById('btn-copy');
  const btnDownload = document.getElementById('btn-download');

  const PRESETS = {
    "email": "[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}",
    "url": "https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)",
    "ipv4": "\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b",
    "ipv6": "(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))",
    "phone": "\\+?\\d{1,4}?[-.\\s]?\\(?\\d{1,3}?\\)?[-.\\s]?\\d{1,4}[-.\\s]?\\d{1,4}[-.\\s]?\\d{1,9}",
    "date-iso": "\\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12][0-9]|3[01])",
    "time-24": "^([01]?[0-9]|2[0-3]):[0-5][0-9]$",
    "hex-color": "#(?:[0-9a-fA-F]{3}){1,2}\\b",
    "credit-card": "^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|3(?:0[0-5]|[68][0-9])[0-9]{11}|6(?:011|5[0-9]{2})[0-9]{12}|(?:2131|1800|35\\d{3})\\d{11})$",
    "slug": "^[a-z0-9]+(?:-[a-z0-9]+)*$",
    "html-tag": "<\\/?\\s*[a-zA-Z0-9]*\\s*\\/?>",
    "html-comment": "<!--[\\s\\S]*?-->",
    "mac-address": "^([0-9A-Fa-f]{2}[:-]){5}([0-9A-Fa-f]{2})$",
    "uuid": "^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$",
    "password": "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
    "base64": "^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$",
    "md5": "^[a-f0-9]{32}$",
    "sha256": "^[a-f0-9]{64}$",
    "bitcoin": "^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,39}$",
    "css-class": "\\.[a-zA-Z_][\\w-]*"
  };

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

  function getActiveFlags() {
    let f = '';
    for (const [key, el] of Object.entries(flagEls)) {
      if (el && el.checked) f += key;
    }
    return f;
  }

  function evaluateRegex() {
    if (!outputEl) return;
    
    const patternStr = patternEl ? patternEl.value : '';
    const flags = getActiveFlags();
    const testStr = inputEl.value;

    if (!patternStr || !testStr) {
      outputEl.innerHTML = '<div style="color: var(--text-tertiary);">Matches will appear here...</div>';
      outputEl.dataset.raw = '';
      if (statusEl) statusEl.innerHTML = '';
      return;
    }

    try {
      const activeRegex = new RegExp(patternStr, flags);
      const hlFlags = flags.includes('g') ? flags : flags + 'g';
      const hlRegex = new RegExp(patternStr, hlFlags);
      
      let matches = [];
      if (flags.includes('g')) {
        matches = [...testStr.matchAll(activeRegex)];
      } else {
        const match = activeRegex.exec(testStr);
        if (match) matches.push(match);
      }

      let highlightedHtml = '';
      let lastIndex = 0;
      let safeMatchCount = 0;
      
      let matchForHl;
      while ((matchForHl = hlRegex.exec(testStr)) !== null) {
        if (matchForHl[0].length === 0) {
          hlRegex.lastIndex++;
        }
        highlightedHtml += escapeHtml(testStr.substring(lastIndex, matchForHl.index));
        highlightedHtml += `<mark style="background: var(--accent-dim); color: var(--accent); border-radius: 2px; padding: 0 2px;">${escapeHtml(matchForHl[0])}</mark>`;
        lastIndex = matchForHl.index + matchForHl[0].length;
        safeMatchCount++;
        if (safeMatchCount > 5000) break; 
      }
      highlightedHtml += escapeHtml(testStr.substring(lastIndex));

      let tableHtml = '';
      let rawOutput = `Regex: /${patternStr}/${flags}\nTarget: ${testStr}\n\nMatches (${matches.length}):\n`;

      if (matches.length > 0) {
        tableHtml = `
          <div style="margin-bottom: var(--space-4); padding: var(--space-3); background: var(--bg-primary); border: 1px solid var(--border-default); border-radius: var(--radius-md); font-family: var(--font-mono); font-size: var(--text-sm); white-space: pre-wrap; word-break: break-all;">${highlightedHtml}</div>
          <table style="width: 100%; border-collapse: collapse; font-family: var(--font-mono); font-size: var(--text-sm);">
            <thead>
              <tr style="border-bottom: 1px solid var(--border-strong); color: var(--text-secondary); text-align: left;">
                <th style="padding: 8px;">#</th>
                <th style="padding: 8px;">Match</th>
                <th style="padding: 8px;">Index</th>
                <th style="padding: 8px;">Groups</th>
              </tr>
            </thead>
            <tbody>
        `;

        matches.forEach((m, i) => {
          let groupStr = '';
          if (m.length > 1) {
            const groups = m.slice(1);
            groupStr = groups.map((g, idx) => `[${idx + 1}]: ${g !== undefined ? `"${escapeHtml(g)}"` : 'undefined'}`).join('<br>');
            rawOutput += `[Match ${i}] Index ${m.index}: "${m[0]}"\n  Groups:\n` + groups.map((g, idx) => `    [${idx + 1}]: ${g}`).join('\n') + '\n';
          } else {
            rawOutput += `[Match ${i}] Index ${m.index}: "${m[0]}"\n`;
          }

          tableHtml += `
            <tr style="border-bottom: 1px solid var(--border-subtle);">
              <td style="padding: 8px; color: var(--text-tertiary);">${i + 1}</td>
              <td style="padding: 8px; color: var(--accent);">${escapeHtml(m[0])}</td>
              <td style="padding: 8px; color: var(--syntax-number);">${m.index}</td>
              <td style="padding: 8px; color: var(--syntax-string);">${groupStr || '-'}</td>
            </tr>
          `;
        });
        tableHtml += `</tbody></table>`;
      } else {
        tableHtml = `
          <div style="margin-bottom: var(--space-4); padding: var(--space-3); background: var(--bg-primary); border: 1px solid var(--border-default); border-radius: var(--radius-md); font-family: var(--font-mono); font-size: var(--text-sm); white-space: pre-wrap; word-break: break-all;">${escapeHtml(testStr)}</div>
          <div style="color: var(--text-tertiary);">No matches found.</div>
        `;
        rawOutput += "No matches found.";
      }

      outputEl.innerHTML = tableHtml;
      outputEl.dataset.raw = rawOutput;

      if (statusEl) {
        statusEl.innerHTML = `<span style="color: var(--color-success);">✓ Valid Pattern</span> <span style="color: var(--border-strong);">·</span> ${matches.length} matches found`;
      }

      if (typeof window.saveToolInput === 'function') {
        window.saveToolInput(TOOL_ID + '-pattern', patternStr);
        window.saveToolInput(TOOL_ID + '-flags', flags);
        window.saveToolInput(TOOL_ID + '-text', testStr);
      }

    } catch (e) {
      outputEl.innerHTML = '';
      outputEl.dataset.raw = '';
      if (statusEl) {
        statusEl.innerHTML = `<span style="color: var(--color-error);">✗ Invalid Regular Expression: ${e.message}</span>`;
      }
    }
  }

  const debouncedEval = debounce(evaluateRegex, 200);

  if (inputEl) inputEl.addEventListener('input', debouncedEval);
  if (patternEl) patternEl.addEventListener('input', debouncedEval);
  
  Object.values(flagEls).forEach(el => {
    if (el) el.addEventListener('change', evaluateRegex);
  });

  if (presetSelect && patternEl) {
    presetSelect.addEventListener('change', (e) => {
      const val = e.target.value;
      if (PRESETS[val]) {
        patternEl.value = PRESETS[val];
        if (flagEls.g) flagEls.g.checked = true;
        if (flagEls.m) flagEls.m.checked = true;
        evaluateRegex();
      }
      e.target.value = "";
    });
  }

  if (btnRun) {
    btnRun.addEventListener('click', () => {
      evaluateRegex();
      if (typeof window.trackToolUse === 'function') window.trackToolUse(TOOL_ID);
    });
  }

  if (btnClear) {
    btnClear.addEventListener('click', () => {
      if (inputEl) inputEl.value = '';
      if (patternEl) patternEl.value = '';
      if (outputEl) {
        outputEl.innerHTML = '<div style="color: var(--text-tertiary);">Matches will appear here...</div>';
        outputEl.dataset.raw = '';
      }
      if (statusEl) statusEl.innerHTML = '';
      if (patternEl) patternEl.focus();
      
      if (typeof window.saveToolInput === 'function') {
        window.saveToolInput(TOOL_ID + '-pattern', '');
        window.saveToolInput(TOOL_ID + '-text', '');
      }
    });
  }

  if (btnPaste) {
    btnPaste.addEventListener('click', async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (inputEl) {
          inputEl.value = text;
          evaluateRegex();
        }
      } catch (err) {
        if (typeof window.showToast === 'function') {
          window.showToast('Clipboard permission denied.', 'error');
        }
      }
    });
  }

  if (btnSample) {
    btnSample.addEventListener('click', () => {
      if (patternEl) patternEl.value = PRESETS['email'];
      if (flagEls.g) flagEls.g.checked = true;
      if (flagEls.m) flagEls.m.checked = true;
      if (inputEl) {
        inputEl.value = "Contact us at support@zerotools.dev or admin@example.co.uk.\nInvalid emails like test@domain or user@.com should not match.";
      }
      evaluateRegex();
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
      a.download = `regex-matches-${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  function init() {
    if (typeof window.loadToolInput === 'function') {
      const savedPattern = window.loadToolInput(TOOL_ID + '-pattern');
      const savedText = window.loadToolInput(TOOL_ID + '-text');
      const savedFlags = window.loadToolInput(TOOL_ID + '-flags');

      if (savedPattern && patternEl) patternEl.value = savedPattern;
      if (savedText && inputEl) inputEl.value = savedText;
      
      if (savedFlags) {
        Object.keys(flagEls).forEach(f => {
          if (flagEls[f]) flagEls[f].checked = savedFlags.includes(f);
        });
      }

      if (savedPattern || savedText) {
        evaluateRegex();
      }
    }
  }

  init();

})();