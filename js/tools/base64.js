(function () {
  const TOOL_ID = 'base64';
  
  const inputEl = document.getElementById('input');
  const outputEl = document.getElementById('output');
  const statusEl = document.getElementById('status');
  const previewContainer = document.getElementById('img-preview-container');
  
  const btnRun = document.getElementById('btn-run');
  const btnClear = document.getElementById('btn-clear');
  const btnPaste = document.getElementById('btn-paste');
  const btnSample = document.getElementById('btn-sample');
  const btnCopy = document.getElementById('btn-copy');
  const btnDownload = document.getElementById('btn-download');
  
  const modeRadios = document.querySelectorAll('input[name="mode"]');
  const optUrlSafe = document.getElementById('opt-url-safe');

  let currentFile = null;

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

  function isLikelyBase64(str) {
    if (str.length < 4 || str.includes(' ')) return false;
    const b64Regex = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
    const urlSafeB64Regex = /^(?:[A-Za-z0-9-_]{4})*(?:[A-Za-z0-9-_]{2}==|[A-Za-z0-9-_]{3}=)?$/;
    return b64Regex.test(str) || urlSafeB64Regex.test(str);
  }

  function encodeBase64(str, urlSafe) {
    let encoded = btoa(unescape(encodeURIComponent(str)));
    if (urlSafe) {
      encoded = encoded.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    }
    return encoded;
  }

  function decodeBase64(str) {
    let normalized = str.replace(/-/g, '+').replace(/_/g, '/');
    while (normalized.length % 4) {
      normalized += '=';
    }
    return decodeURIComponent(escape(atob(normalized)));
  }

  function processText() {
    const rawInput = inputEl.value.trim();
    if (!rawInput && !currentFile) {
      outputEl.textContent = '';
      statusEl.innerHTML = '';
      if (previewContainer) previewContainer.innerHTML = '';
      return;
    }

    let mode = 'encode';
    modeRadios.forEach(r => { if (r.checked) mode = r.value; });
    const isUrlSafe = optUrlSafe.checked;

    if (mode === 'encode' && !currentFile && isLikelyBase64(rawInput) && rawInput.length > 20) {
      if (typeof window.showToast === 'function' && !inputEl.dataset.warned) {
        window.showToast('Input looks like Base64. Did you mean to Decode?', 'info');
        inputEl.dataset.warned = 'true';
      }
    } else {
      inputEl.dataset.warned = 'false';
    }

    if (previewContainer) previewContainer.innerHTML = '';

    try {
      let result = '';

      if (currentFile) {
         if (mode === 'encode') {
           result = inputEl.dataset.fileb64 || '';
           if (isUrlSafe) {
             result = result.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
           }
         } else {
           throw new Error("Cannot decode a raw file directly. Please paste a Base64 string.");
         }
      } else {
        if (mode === 'encode') {
          result = encodeBase64(rawInput, isUrlSafe);
        } else {
          result = decodeBase64(rawInput);
          
          if (result.startsWith('data:image/')) {
            if (previewContainer) {
              previewContainer.innerHTML = `<div style="margin-top:16px; border:1px solid var(--border-default); border-radius:var(--radius-md); padding:8px; background:var(--bg-tertiary); display:inline-block;"><img src="${result}" style="max-width:100%; max-height:300px; display:block; border-radius:var(--radius-sm);" alt="Decoded preview" /></div>`;
            }
          }
        }
      }

      outputEl.textContent = result;
      
      const inSize = currentFile ? currentFile.size : new Blob([rawInput]).size;
      const outSize = new Blob([result]).size;
      
      statusEl.innerHTML = `<span style="color: var(--color-success);">✓ Success</span> <span style="color: var(--border-strong);">·</span> Input: ${formatBytes(inSize)} <span style="color: var(--border-strong);">·</span> Output: ${formatBytes(outSize)}`;
      statusEl.style.color = 'var(--text-tertiary)';

      if (!currentFile && typeof window.saveToolInput === 'function') {
        window.saveToolInput(TOOL_ID, rawInput);
      }

    } catch (e) {
      outputEl.textContent = '';
      statusEl.innerHTML = `<span style="color: var(--color-error);">✗ Error: ${e.message.includes('URI') ? 'Malformed input or invalid Base64 string.' : e.message}</span>`;
    }
  }

  function handleFileDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    inputEl.style.borderColor = 'var(--border-default)';
    inputEl.style.background = 'var(--bg-tertiary)';

    const file = e.dataTransfer.files[0];
    if (!file) return;

    currentFile = file;
    document.querySelector('input[name="mode"][value="encode"]').checked = true;
    inputEl.value = `[File attached: ${file.name} (${formatBytes(file.size)})]`;
    inputEl.disabled = true;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target.result;
      const base64Data = dataUrl.split(',')[1];
      inputEl.dataset.fileb64 = base64Data;
      processText();
    };
    reader.readAsDataURL(file);
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

  inputEl.addEventListener('input', () => {
    if (currentFile) {
      currentFile = null;
      inputEl.dataset.fileb64 = '';
      inputEl.disabled = false;
    }
    debounce(processText, 200)();
  });

  inputEl.addEventListener('dragover', handleDragOver);
  inputEl.addEventListener('dragleave', handleDragLeave);
  inputEl.addEventListener('drop', handleFileDrop);

  modeRadios.forEach(r => r.addEventListener('change', processText));
  optUrlSafe.addEventListener('change', processText);

  if (btnRun) {
    btnRun.addEventListener('click', () => {
      processText();
      if (typeof window.trackToolUse === 'function') window.trackToolUse(TOOL_ID);
    });
  }

  if (btnClear) {
    btnClear.addEventListener('click', () => {
      inputEl.value = '';
      inputEl.disabled = false;
      currentFile = null;
      inputEl.dataset.fileb64 = '';
      outputEl.textContent = '';
      statusEl.innerHTML = '';
      if (previewContainer) previewContainer.innerHTML = '';
      inputEl.focus();
      if (typeof window.saveToolInput === 'function') window.saveToolInput(TOOL_ID, '');
    });
  }

  if (btnPaste) {
    btnPaste.addEventListener('click', async () => {
      try {
        const text = await navigator.clipboard.readText();
        inputEl.disabled = false;
        currentFile = null;
        inputEl.value = text;
        processText();
      } catch (err) {
        if (typeof window.showToast === 'function') {
          window.showToast('Clipboard permission denied.', 'error');
        }
      }
    });
  }

  if (btnSample) {
    btnSample.addEventListener('click', () => {
      inputEl.disabled = false;
      currentFile = null;
      document.querySelector('input[name="mode"][value="encode"]').checked = true;
      inputEl.value = '{"project":"ZeroTools","status":"Building","privacy":"100% Client-Side"}';
      processText();
    });
  }

  if (btnCopy) {
    btnCopy.addEventListener('click', () => {
      const rawOutput = outputEl.textContent;
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
      const rawOutput = outputEl.textContent;
      if (!rawOutput) return;

      const mode = document.querySelector('input[name="mode"]:checked').value;
      const ext = mode === 'encode' ? 'txt' : 'bin';
      
      const blob = new Blob([rawOutput], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      
      a.href = url;
      a.download = `base64-${mode}d-${Date.now()}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  function init() {
    if (typeof window.loadToolInput === 'function') {
      const savedInput = window.loadToolInput(TOOL_ID);
      if (savedInput) {
        inputEl.value = savedInput;
        processText();
      }
    }
  }

  init();
})();