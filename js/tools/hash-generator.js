(function () {
  const TOOL_ID = 'hash-generator';
  
  // DOM Elements
  const inputEl = document.getElementById('input');
  const outputEl = document.getElementById('output');
  const statusEl = document.getElementById('status');
  
  const hmacKeyEl = document.getElementById('hmac-key');
  const compareHashEl = document.getElementById('compare-hash');
  const optShowAll = document.getElementById('opt-show-all');
  const algoRadios = document.querySelectorAll('input[name="algo"]');
  
  const btnRun = document.getElementById('btn-run');
  const btnClear = document.getElementById('btn-clear');
  const btnPaste = document.getElementById('btn-paste');
  const btnSample = document.getElementById('btn-sample');
  const btnCopy = document.getElementById('btn-copy');
  const btnDownload = document.getElementById('btn-download');

  let currentFile = null;
  let currentFileBuffer = null;

  const algorithms = {
    'MD5': { fn: CryptoJS.MD5, hmac: CryptoJS.HmacMD5, bits: 128 },
    'SHA-1': { fn: CryptoJS.SHA1, hmac: CryptoJS.HmacSHA1, bits: 160 },
    'SHA-256': { fn: CryptoJS.SHA256, hmac: CryptoJS.HmacSHA256, bits: 256 },
    'SHA-512': { fn: CryptoJS.SHA512, hmac: CryptoJS.HmacSHA512, bits: 512 },
    'SHA-3': { fn: CryptoJS.SHA3, hmac: CryptoJS.HmacSHA3, bits: 512 }
  };

  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  function formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  function computeHash(algoName, inputData, hmacKey) {
    const alg = algorithms[algoName];
    if (hmacKey) {
      return alg.hmac(inputData, hmacKey).toString(CryptoJS.enc.Hex);
    }
    return alg.fn(inputData).toString(CryptoJS.enc.Hex);
  }

  function processHash() {
    if (!outputEl) return;
    
    const rawText = inputEl.value;
    const hmacKey = hmacKeyEl ? hmacKeyEl.value : '';
    const compareTo = compareHashEl ? compareHashEl.value.trim().toLowerCase() : '';
    const showAll = optShowAll ? optShowAll.checked : false;
    
    let activeAlgo = 'SHA-256';
    if (algoRadios.length > 0) {
      algoRadios.forEach(r => { if (r.checked) activeAlgo = r.value; });
    }

    if (!rawText && !currentFileBuffer) {
      outputEl.innerHTML = '<div style="color: var(--text-tertiary);">Generated hash will appear here...</div>';
      outputEl.dataset.raw = '';
      if (statusEl) statusEl.innerHTML = '';
      return;
    }

    try {
      let inputData = rawText;
      if (currentFileBuffer) {
        inputData = CryptoJS.lib.WordArray.create(currentFileBuffer);
      }

      let htmlOutput = '';
      let rawOutput = '';
      let matchStatus = '';

      if (showAll) {
        htmlOutput += `<table style="width: 100%; border-collapse: collapse; font-family: var(--font-mono); font-size: var(--text-sm);"><tbody>`;
        
        for (const [name, config] of Object.entries(algorithms)) {
          const hashVal = computeHash(name, inputData, hmacKey);
          rawOutput += `${name}: ${hashVal}\n`;
          
          let isMatch = false;
          if (compareTo) {
            if (hashVal === compareTo) {
              isMatch = true;
              matchStatus = `<span style="color: var(--color-success); font-weight: bold; margin-left: 8px;">[✓ Match Found: ${name}]</span>`;
            }
          }

          htmlOutput += `
            <tr style="border-bottom: 1px solid var(--border-subtle); ${isMatch ? 'background: var(--accent-dim);' : ''}">
              <td style="padding: 12px 8px; color: var(--text-secondary); width: 80px; font-weight: 600;">${name}</td>
              <td style="padding: 12px 8px; color: var(--text-primary); word-break: break-all; user-select: all;">${hashVal}</td>
            </tr>
          `;
        }
        htmlOutput += `</tbody></table>`;
        if (compareTo && !matchStatus) {
           matchStatus = `<span style="color: var(--color-error); font-weight: bold; margin-left: 8px;">[✗ No Match]</span>`;
        }

      } else {
        const hashVal = computeHash(activeAlgo, inputData, hmacKey);
        rawOutput = hashVal;
        
        let matchStyle = '';
        if (compareTo) {
          if (hashVal === compareTo) {
            matchStatus = `<span style="color: var(--color-success); font-weight: bold; margin-left: 8px;">[✓ Match!]</span>`;
            matchStyle = 'color: var(--color-success); font-weight: 600;';
          } else {
            matchStatus = `<span style="color: var(--color-error); font-weight: bold; margin-left: 8px;">[✗ Mismatch]</span>`;
            matchStyle = 'color: var(--color-error);';
          }
        }

        htmlOutput = `
          <div style="font-family: var(--font-mono); font-size: var(--text-lg); word-break: break-all; user-select: all; ${matchStyle}">${hashVal}</div>
          <div style="margin-top: 16px; color: var(--text-tertiary); font-size: var(--text-xs); text-transform: uppercase; letter-spacing: 0.05em;">
            Algorithm: <span style="color: var(--text-secondary);">${activeAlgo}</span> &nbsp;&nbsp;
            Length: <span style="color: var(--text-secondary);">${algorithms[activeAlgo].bits} bits</span>
            ${hmacKey ? '&nbsp;&nbsp;<span style="color: var(--syntax-key);">[HMAC ENABLED]</span>' : ''}
          </div>
        `;
      }

      outputEl.innerHTML = htmlOutput;
      outputEl.dataset.raw = rawOutput;

      if (statusEl) {
        const sourceType = currentFile ? `File: ${currentFile.name} (${formatBytes(currentFile.size)})` : `${rawText.length} characters`;
        statusEl.innerHTML = `<span style="color: var(--color-success);">✓ Hashed Successfully</span> <span style="color: var(--border-strong);">·</span> ${sourceType}${matchStatus}`;
      }

      if (!currentFileBuffer && typeof window.saveToolInput === 'function') {
        window.saveToolInput(TOOL_ID, rawText);
        if (hmacKeyEl) window.saveToolInput(TOOL_ID + '-hmac', hmacKey);
      }

    } catch (e) {
      outputEl.innerHTML = '';
      outputEl.dataset.raw = '';
      if (statusEl) {
        statusEl.innerHTML = `<span style="color: var(--color-error);">✗ Error generating hash: ${e.message}</span>`;
      }
    }
  }

  // --- File Drag & Drop Logic ---
  function handleFileDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    inputEl.style.borderColor = 'var(--border-default)';
    inputEl.style.background = 'var(--bg-tertiary)';

    const file = e.dataTransfer.files[0];
    if (!file) return;

    // Reject extremely large files to prevent browser crash (limit to 50MB for purely browser-based hashing)
    if (file.size > 50 * 1024 * 1024) {
      if (typeof window.showToast === 'function') window.showToast('File too large (Max 50MB for browser hashing)', 'error');
      return;
    }

    currentFile = file;
    inputEl.value = `[File queued: ${file.name} (${formatBytes(file.size)})]`;
    inputEl.disabled = true;

    const reader = new FileReader();
    reader.onload = (event) => {
      currentFileBuffer = event.target.result;
      processHash();
    };
    reader.readAsArrayBuffer(file);
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    inputEl.style.borderColor = 'var(--accent)';
    inputEl.style.background = 'var(--accent-dim)';
  }

  function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    inputEl.style.borderColor = 'var(--border-default)';
    inputEl.style.background = 'var(--bg-tertiary)';
  }

  // --- Event Listeners ---
  const debouncedProcess = debounce(processHash, 250);

  if (inputEl) {
    inputEl.addEventListener('input', () => {
      if (currentFileBuffer) {
        currentFile = null;
        currentFileBuffer = null;
        inputEl.disabled = false;
      }
      debouncedProcess();
    });
    inputEl.addEventListener('dragover', handleDragOver);
    inputEl.addEventListener('dragleave', handleDragLeave);
    inputEl.addEventListener('drop', handleFileDrop);
  }

  if (hmacKeyEl) hmacKeyEl.addEventListener('input', debouncedProcess);
  if (compareHashEl) compareHashEl.addEventListener('input', debouncedProcess);
  if (optShowAll) optShowAll.addEventListener('change', processHash);
  algoRadios.forEach(r => r.addEventListener('change', processHash));

  if (btnRun) {
    btnRun.addEventListener('click', () => {
      processHash();
      if (typeof window.trackToolUse === 'function') window.trackToolUse(TOOL_ID);
    });
  }

  if (btnClear) {
    btnClear.addEventListener('click', () => {
      if (inputEl) {
        inputEl.value = '';
        inputEl.disabled = false;
      }
      currentFile = null;
      currentFileBuffer = null;
      if (hmacKeyEl) hmacKeyEl.value = '';
      if (compareHashEl) compareHashEl.value = '';
      if (optShowAll) optShowAll.checked = false;
      
      outputEl.innerHTML = '<div style="color: var(--text-tertiary);">Generated hash will appear here...</div>';
      outputEl.dataset.raw = '';
      if (statusEl) statusEl.innerHTML = '';
      if (inputEl) inputEl.focus();
      
      if (typeof window.saveToolInput === 'function') {
        window.saveToolInput(TOOL_ID, '');
        window.saveToolInput(TOOL_ID + '-hmac', '');
      }
    });
  }

  if (btnPaste) {
    btnPaste.addEventListener('click', async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (inputEl) {
          inputEl.disabled = false;
          currentFile = null;
          currentFileBuffer = null;
          inputEl.value = text;
          processHash();
        }
      } catch (err) {
        if (typeof window.showToast === 'function') window.showToast('Clipboard permission denied.', 'error');
      }
    });
  }

  if (btnSample) {
    btnSample.addEventListener('click', () => {
      if (inputEl) {
        inputEl.disabled = false;
        currentFile = null;
        currentFileBuffer = null;
        inputEl.value = "The quick brown fox jumps over the lazy dog";
      }
      if (hmacKeyEl) hmacKeyEl.value = "secret_key_123";
      if (optShowAll) optShowAll.checked = false;
      if (algoRadios[2]) algoRadios[2].checked = true; // Set to SHA-256
      processHash();
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
      a.download = `hashes-${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  function init() {
    if (typeof window.loadToolInput === 'function') {
      const savedInput = window.loadToolInput(TOOL_ID);
      const savedHmac = window.loadToolInput(TOOL_ID + '-hmac');
      if (savedInput && inputEl) inputEl.value = savedInput;
      if (savedHmac && hmacKeyEl) hmacKeyEl.value = savedHmac;
      if (savedInput || savedHmac) processHash();
    }
  }

  init();
})();