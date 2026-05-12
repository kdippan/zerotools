(function () {
  const TOOL_ID = 'uuid-generator';
  const outputEl = document.getElementById('output');
  const statusEl = document.getElementById('status');
  const btnRun = document.getElementById('btn-run');
  const btnCopyAll = document.getElementById('btn-copy');
  const btnDownload = document.getElementById('btn-download');

  const formatSelect = document.getElementById('format-select');
  const qtyInput = document.getElementById('qty-input');
  const optUpper = document.getElementById('opt-upper');
  const optNoHyphens = document.getElementById('opt-nohyphens');
  const optQuoted = document.getElementById('opt-quoted');

  let generatedIds = [];

  function uuidV4() {
    return crypto.randomUUID();
  }

  function uuidV1() {
    const now = Date.now();
    const timeLow = (now & 0xffffffff).toString(16).padStart(8, '0');
    const timeMid = ((now >> 32) & 0xffff).toString(16).padStart(4, '0');
    const timeHiAndVersion = (((now >> 48) & 0x0fff) | 0x1000).toString(16).padStart(4, '0');
    const clockSeq = ((crypto.getRandomValues(new Uint16Array(1))[0] & 0x3fff) | 0x8000).toString(16).padStart(4, '0');
    const node = Array.from(crypto.getRandomValues(new Uint8Array(6))).map(b => b.toString(16).padStart(2, '0')).join('');
    return `${timeLow}-${timeMid}-${timeHiAndVersion}-${clockSeq}-${node}`;
  }

  function uuidV7() {
    const ts = Date.now().toString(16).padStart(12, '0');
    const rand = crypto.getRandomValues(new Uint8Array(10));
    rand[0] = (rand[0] & 0x0f) | 0x70;
    rand[2] = (rand[2] & 0x3f) | 0x80;
    const randHex = Array.from(rand).map(b => b.toString(16).padStart(2, '0')).join('');
    return `${ts.slice(0, 8)}-${ts.slice(8, 12)}-${randHex.slice(0, 4)}-${randHex.slice(4, 8)}-${randHex.slice(8, 20)}`;
  }

  function nanoId(size = 21) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_-';
    const bytes = crypto.getRandomValues(new Uint8Array(size));
    return Array.from(bytes, b => chars[b % 64]).join('');
  }

  function cuid2() {
    const entropy = Array.from(crypto.getRandomValues(new Uint8Array(16))).map(b => b.toString(16).padStart(2, '0')).join('');
    const ts = Date.now().toString(36);
    return `tz${ts}${entropy}`.substring(0, 24);
  }

  function generate() {
    let qty = parseInt(qtyInput ? qtyInput.value : 1, 10);
    if (isNaN(qty) || qty < 1) qty = 1;
    if (qty > 10000) qty = 10000;
    
    const format = formatSelect ? formatSelect.value : 'v4';
    const isUpper = optUpper && optUpper.checked;
    const isNoHyphens = optNoHyphens && optNoHyphens.checked;
    const isQuoted = optQuoted && optQuoted.checked;

    generatedIds = [];
    for (let i = 0; i < qty; i++) {
      let id = '';
      if (format === 'v4') id = uuidV4();
      else if (format === 'v1') id = uuidV1();
      else if (format === 'v7') id = uuidV7();
      else if (format === 'nanoid') id = nanoId();
      else if (format === 'cuid2') id = cuid2();

      if (isUpper) id = id.toUpperCase();
      if (isNoHyphens && format.includes('v')) id = id.replace(/-/g, '');
      if (isQuoted) id = `"${id}"`;

      generatedIds.push(id);
    }

    renderOutput();
    
    if (statusEl) {
      statusEl.innerHTML = `<span style="color: var(--color-success);">✓ Generated ${qty.toLocaleString()} IDs</span>`;
    }
  }

  function renderOutput() {
    if (!outputEl) return;
    
    outputEl.innerHTML = '';
    outputEl.style.padding = '0';
    outputEl.style.background = 'transparent';
    outputEl.style.border = 'none';

    const listContainer = document.createElement('div');
    listContainer.style.display = 'flex';
    listContainer.style.flexDirection = 'column';
    listContainer.style.gap = 'var(--space-1)';
    listContainer.style.maxHeight = '350px';
    listContainer.style.overflowY = 'auto';
    listContainer.style.background = 'var(--bg-tertiary)';
    listContainer.style.border = '1px solid var(--border-default)';
    listContainer.style.borderRadius = 'var(--radius-md)';
    listContainer.style.padding = 'var(--space-2)';

    const fragment = document.createDocumentFragment();
    const limit = Math.min(generatedIds.length, 1000); 

    for (let i = 0; i < limit; i++) {
      const row = document.createElement('div');
      row.style.display = 'flex';
      row.style.justifyContent = 'space-between';
      row.style.alignItems = 'center';
      row.style.padding = '4px 8px';
      row.style.borderRadius = 'var(--radius-sm)';
      row.style.transition = 'background 0.15s ease';
      row.onmouseover = () => row.style.background = 'var(--bg-elevated)';
      row.onmouseout = () => row.style.background = 'transparent';

      const text = document.createElement('span');
      text.style.fontFamily = 'var(--font-mono)';
      text.style.fontSize = 'var(--text-sm)';
      text.style.color = 'var(--text-primary)';
      text.style.userSelect = 'all';
      text.textContent = generatedIds[i];

      const copyBtn = document.createElement('button');
      copyBtn.className = 'btn-ghost';
      copyBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
      copyBtn.title = 'Copy';
      copyBtn.style.padding = '4px';
      
      copyBtn.onclick = () => {
        if (typeof window.copyToClipboard === 'function') {
          window.copyToClipboard(generatedIds[i], copyBtn);
          copyBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
          setTimeout(() => {
            copyBtn.innerHTML = '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
          }, 2000);
        } else {
          navigator.clipboard.writeText(generatedIds[i]);
        }
      };

      row.appendChild(text);
      row.appendChild(copyBtn);
      fragment.appendChild(row);
    }
    
    if (generatedIds.length > 1000) {
      const msg = document.createElement('div');
      msg.style.padding = '12px 8px';
      msg.style.color = 'var(--text-tertiary)';
      msg.style.fontSize = 'var(--text-xs)';
      msg.style.fontFamily = 'var(--font-mono)';
      msg.style.textAlign = 'center';
      msg.textContent = `[ ${generatedIds.length - 1000} more IDs generated but hidden to save memory. Use Copy All or Download. ]`;
      fragment.appendChild(msg);
    }

    listContainer.appendChild(fragment);
    outputEl.appendChild(listContainer);
  }

  if (btnRun) {
    btnRun.addEventListener('click', () => {
      generate();
      if (typeof window.trackToolUse === 'function') window.trackToolUse(TOOL_ID);
    });
  }

  [formatSelect, optUpper, optNoHyphens, optQuoted].forEach(el => {
    if (el) el.addEventListener('change', generate);
  });

  if (qtyInput) {
    qtyInput.addEventListener('input', () => {
      if (qtyInput.value && parseInt(qtyInput.value, 10) > 0) generate();
    });
  }

  if (btnCopyAll) {
    btnCopyAll.addEventListener('click', () => {
      if (!generatedIds.length) return;
      const allText = generatedIds.join('\n');
      if (typeof window.copyToClipboard === 'function') {
        window.copyToClipboard(allText, btnCopyAll);
      } else {
        navigator.clipboard.writeText(allText);
      }
      if (typeof window.trackCopy === 'function') window.trackCopy(TOOL_ID);
    });
  }

  if (btnDownload) {
    btnDownload.addEventListener('click', () => {
      if (!generatedIds.length) return;
      const allText = generatedIds.join('\n');
      const blob = new Blob([allText], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `uuids-${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  generate();

})();