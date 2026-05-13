(function () {
  const TOOL_ID = 'jwt-decoder';

  const inputEl = document.getElementById('input');
  const outputEl = document.getElementById('output');
  const statusEl = document.getElementById('status');
  
  const btnRun = document.getElementById('btn-run');
  const btnClear = document.getElementById('btn-clear');
  const btnPaste = document.getElementById('btn-paste');
  const btnSample = document.getElementById('btn-sample');
  const btnCopy = document.getElementById('btn-copy');
  const btnDownload = document.getElementById('btn-download');

  const optionsContainer = document.querySelector('.tool-options');
  if (optionsContainer && optionsContainer.innerHTML.trim() === '') {
    optionsContainer.innerHTML = `
      <div style="display: flex; align-items: center; gap: var(--space-3); width: 100%; max-width: 600px;">
        <label style="font-family: var(--font-mono); font-size: var(--text-xs); color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.05em; white-space: nowrap;">HMAC Secret</label>
        <input type="text" class="input" id="jwt-secret" placeholder="Paste secret key to verify signature..." spellcheck="false">
      </div>
      <div id="verify-badge" style="font-family: var(--font-mono); font-size: var(--text-xs); padding: 4px 8px; border-radius: var(--radius-sm); background: var(--bg-tertiary); color: var(--text-secondary); border: 1px solid var(--border-default);">
        ⚠ Signature not verified
      </div>
    `;
  }

  const secretEl = document.getElementById('jwt-secret');
  const verifyBadge = document.getElementById('verify-badge');

  const STANDARD_CLAIMS = {
    'iss': 'Issuer',
    'sub': 'Subject',
    'aud': 'Audience',
    'exp': 'Expiration Time',
    'nbf': 'Not Before',
    'iat': 'Issued At',
    'jti': 'JWT ID'
  };

  const SAMPLE_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9." + 
                     "eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkRpcHBhbiBCaHVzYWwiLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE1MTYyMzkwMjIsImV4cCI6MjUzNjI3MjAwMH0." + 
                     "wW2tBpxI61s5z4kU6aH8A-v2x-5W9jY2Jk4_9bH6x5A";

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

  function b64DecodeUnicode(str) {
    const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    const pad = base64.length % 4;
    const padded = pad ? base64 + new Array(5 - pad).join('=') : base64;
    
    return decodeURIComponent(atob(padded).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
  }

  function base64UrlEncode(buffer) {
    let binary = '';
    const bytes = new Uint8Array(buffer);
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
  }

  async function verifyHMAC(headerB64, payloadB64, signatureB64, secret) {
    try {
      const enc = new TextEncoder();
      const algorithm = { name: 'HMAC', hash: 'SHA-256' };
      const key = await crypto.subtle.importKey(
        'raw',
        enc.encode(secret),
        algorithm,
        false,
        ['sign']
      );
      
      const dataToSign = enc.encode(`${headerB64}.${payloadB64}`);
      const signatureBuffer = await crypto.subtle.sign(algorithm, key, dataToSign);
      const expectedSignature = base64UrlEncode(signatureBuffer);
      
      return expectedSignature === signatureB64;
    } catch (e) {
      return false;
    }
  }

  function syntaxHighlightJSON(jsonStr) {
    let formatted = escapeHtml(jsonStr);
    return formatted.replace(/("(\\u[a-zA-Z0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?)/g, function (match) {
      let cssVar = '--syntax-number';
      if (/^"/.test(match)) {
        if (/:$/.test(match)) {
          return `<span style="color: var(--syntax-key);">${match.slice(0, -1)}</span>:`;
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

  function getTimeStatus(timestamp) {
    if (!timestamp) return null;
    const target = new Date(timestamp * 1000);
    const now = new Date();
    const diffMs = target - now;
    const diffAbs = Math.abs(diffMs);
    
    const days = Math.floor(diffAbs / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diffAbs / (1000 * 60 * 60)) % 24);
    const mins = Math.floor((diffAbs / 1000 / 60) % 60);
    
    let timeStr = '';
    if (days > 0) timeStr += `${days}d `;
    if (hours > 0) timeStr += `${hours}h `;
    timeStr += `${mins}m`;

    const isFuture = diffMs > 0;
    
    return {
      date: target.toLocaleString(),
      relative: isFuture ? `Expires in ${timeStr}` : `Expired ${timeStr} ago`,
      isFuture: isFuture
    };
  }

  async function processJWT() {
    if (!outputEl) return;
    
    const token = inputEl.value.trim();
    const secret = secretEl ? secretEl.value : '';

    if (!token) {
      outputEl.innerHTML = '<div style="color: var(--text-tertiary);">Decoded token will appear here...</div>';
      outputEl.dataset.raw = '';
      if (statusEl) statusEl.innerHTML = '';
      if (verifyBadge) {
        verifyBadge.innerHTML = '⚠ Signature not verified';
        verifyBadge.style.color = 'var(--text-secondary)';
        verifyBadge.style.borderColor = 'var(--border-default)';
        verifyBadge.style.background = 'var(--bg-tertiary)';
      }
      return;
    }

    const parts = token.split('.');
    
    if (parts.length !== 3) {
      outputEl.innerHTML = '';
      outputEl.dataset.raw = '';
      if (statusEl) statusEl.innerHTML = `<span style="color: var(--color-error);">✗ Error: Invalid JWT format. Expected 3 parts separated by dots.</span>`;
      return;
    }

    try {
      const headerRaw = parts[0];
      const payloadRaw = parts[1];
      const signatureRaw = parts[2];

      const headerStr = b64DecodeUnicode(headerRaw);
      const payloadStr = b64DecodeUnicode(payloadRaw);

      const headerObj = JSON.parse(headerStr);
      const payloadObj = JSON.parse(payloadStr);

      const headerFormatted = JSON.stringify(headerObj, null, 2);
      const payloadFormatted = JSON.stringify(payloadObj, null, 2);

      let claimsHtml = '';
      const claims = [];
      for (const [key, val] of Object.entries(payloadObj)) {
        if (STANDARD_CLAIMS[key]) {
          claims.push({ key, name: STANDARD_CLAIMS[key], val });
        }
      }

      if (claims.length > 0) {
        claimsHtml = `
          <div style="margin-top: var(--space-6); margin-bottom: var(--space-3); font-family: var(--font-sans); font-weight: 600; color: var(--text-primary);">Standard Claims</div>
          <table style="width: 100%; border-collapse: collapse; font-family: var(--font-mono); font-size: var(--text-sm);">
            <thead>
              <tr style="border-bottom: 1px solid var(--border-strong); color: var(--text-secondary); text-align: left;">
                <th style="padding: 8px;">Claim</th>
                <th style="padding: 8px;">Description</th>
                <th style="padding: 8px;">Value</th>
              </tr>
            </thead>
            <tbody>
              ${claims.map(c => `
                <tr style="border-bottom: 1px solid var(--border-subtle);">
                  <td style="padding: 8px; color: var(--syntax-key);">${escapeHtml(c.key)}</td>
                  <td style="padding: 8px; color: var(--text-secondary);">${c.name}</td>
                  <td style="padding: 8px; color: var(--text-primary); word-break: break-all;">${escapeHtml(String(c.val))}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        `;
      }

      let expiryHtml = '';
      if (payloadObj.exp) {
        const expStatus = getTimeStatus(payloadObj.exp);
        const color = expStatus.isFuture ? 'var(--color-success)' : 'var(--color-error)';
        expiryHtml = `
          <div style="margin-top: var(--space-4); padding: var(--space-3); border: 1px solid var(--border-default); border-radius: var(--radius-md); background: var(--bg-primary); display: flex; justify-content: space-between; align-items: center; font-family: var(--font-mono); font-size: var(--text-sm);">
            <div><span style="color: var(--text-secondary);">EXP:</span> ${expStatus.date}</div>
            <div style="color: ${color}; font-weight: 600;">${expStatus.relative}</div>
          </div>
        `;
      }

      const rawHtml = `
        <div style="margin-bottom: var(--space-6); font-family: var(--font-mono); font-size: var(--text-base); word-break: break-all; line-height: 1.5; background: var(--bg-primary); padding: var(--space-4); border-radius: var(--radius-md); border: 1px solid var(--border-default);">
          <span style="color: #ff6b9d;">${headerRaw}</span><span style="color: var(--text-secondary);">.</span><span style="color: #00dc82;">${payloadRaw}</span><span style="color: var(--text-secondary);">.</span><span style="color: #0ea5e9;">${signatureRaw}</span>
        </div>
      `;

      const panelsHtml = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: var(--space-4);">
          <div>
            <div style="font-family: var(--font-mono); font-size: var(--text-xs); color: #ff6b9d; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.05em;">Header (Algorithm & Type)</div>
            <div style="background: var(--bg-primary); border: 1px solid var(--border-default); border-radius: var(--radius-md); padding: var(--space-3); font-family: var(--font-mono); font-size: var(--text-sm); white-space: pre-wrap;">${syntaxHighlightJSON(headerFormatted)}</div>
          </div>
          <div>
            <div style="font-family: var(--font-mono); font-size: var(--text-xs); color: #00dc82; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.05em;">Payload (Data)</div>
            <div style="background: var(--bg-primary); border: 1px solid var(--border-default); border-radius: var(--radius-md); padding: var(--space-3); font-family: var(--font-mono); font-size: var(--text-sm); white-space: pre-wrap; max-height: 400px; overflow-y: auto;">${syntaxHighlightJSON(payloadFormatted)}</div>
          </div>
        </div>
        <div style="margin-top: var(--space-4);">
          <div style="font-family: var(--font-mono); font-size: var(--text-xs); color: #0ea5e9; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.05em;">Signature</div>
          <div style="background: var(--bg-primary); border: 1px solid var(--border-default); border-radius: var(--radius-md); padding: var(--space-3); font-family: var(--font-mono); font-size: var(--text-sm); word-break: break-all; color: var(--text-primary);">${escapeHtml(signatureRaw)}</div>
        </div>
      `;

      outputEl.innerHTML = rawHtml + panelsHtml + expiryHtml + claimsHtml;
      
      const rawTextOutput = `Header:\n${headerFormatted}\n\nPayload:\n${payloadFormatted}\n\nSignature:\n${signatureRaw}`;
      outputEl.dataset.raw = rawTextOutput;

      if (statusEl) {
        statusEl.innerHTML = `<span style="color: var(--color-success);">✓ Decoded Successfully</span>`;
      }

      if (typeof window.saveToolInput === 'function') {
        window.saveToolInput(TOOL_ID, token);
      }

      if (secret && headerObj.alg.includes('HS256')) {
        const isValid = await verifyHMAC(headerRaw, payloadRaw, signatureRaw, secret);
        if (verifyBadge) {
          if (isValid) {
            verifyBadge.innerHTML = '✓ Signature Verified';
            verifyBadge.style.color = 'var(--color-success)';
            verifyBadge.style.borderColor = 'var(--color-success)';
            verifyBadge.style.background = 'rgba(0, 220, 130, 0.1)';
          } else {
            verifyBadge.innerHTML = '✗ Invalid Signature';
            verifyBadge.style.color = 'var(--color-error)';
            verifyBadge.style.borderColor = 'var(--color-error)';
            verifyBadge.style.background = 'rgba(255, 77, 77, 0.1)';
          }
        }
      } else {
        if (verifyBadge) {
          verifyBadge.innerHTML = secret ? '⚠ Cannot verify non-HS256' : '⚠ Signature not verified';
          verifyBadge.style.color = 'var(--text-secondary)';
          verifyBadge.style.borderColor = 'var(--border-default)';
          verifyBadge.style.background = 'var(--bg-tertiary)';
        }
      }

    } catch (e) {
      outputEl.innerHTML = '';
      outputEl.dataset.raw = '';
      if (statusEl) {
        statusEl.innerHTML = `<span style="color: var(--color-error);">✗ Error decoding JWT: Not a valid JSON payload.</span>`;
      }
    }
  }

  const debouncedProcess = debounce(processJWT, 200);

  if (inputEl) inputEl.addEventListener('input', debouncedProcess);
  
  if (secretEl) {
    secretEl.addEventListener('input', () => {
      if (typeof window.saveToolInput === 'function') {
        window.saveToolInput(TOOL_ID + '-secret', secretEl.value);
      }
      debouncedProcess();
    });
  }

  if (btnRun) {
    btnRun.addEventListener('click', () => {
      processJWT();
      if (typeof window.trackToolUse === 'function') window.trackToolUse(TOOL_ID);
    });
  }

  if (btnClear) {
    btnClear.addEventListener('click', () => {
      if (inputEl) inputEl.value = '';
      if (secretEl) secretEl.value = '';
      if (outputEl) {
        outputEl.innerHTML = '<div style="color: var(--text-tertiary);">Decoded token will appear here...</div>';
        outputEl.dataset.raw = '';
      }
      if (statusEl) statusEl.innerHTML = '';
      if (verifyBadge) {
        verifyBadge.innerHTML = '⚠ Signature not verified';
        verifyBadge.style.color = 'var(--text-secondary)';
        verifyBadge.style.borderColor = 'var(--border-default)';
        verifyBadge.style.background = 'var(--bg-tertiary)';
      }
      if (inputEl) inputEl.focus();
      
      if (typeof window.saveToolInput === 'function') {
        window.saveToolInput(TOOL_ID, '');
        window.saveToolInput(TOOL_ID + '-secret', '');
      }
    });
  }

  if (btnPaste) {
    btnPaste.addEventListener('click', async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (inputEl) {
          inputEl.value = text;
          processJWT();
        }
      } catch (err) {
        if (typeof window.showToast === 'function') window.showToast('Clipboard permission denied.', 'error');
      }
    });
  }

  if (btnSample) {
    btnSample.addEventListener('click', () => {
      if (inputEl) inputEl.value = SAMPLE_JWT;
      if (secretEl) secretEl.value = "secret";
      processJWT();
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
      a.download = `jwt-decoded-${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  function init() {
    if (typeof window.loadToolInput === 'function') {
      const savedInput = window.loadToolInput(TOOL_ID);
      const savedSecret = window.loadToolInput(TOOL_ID + '-secret');
      if (savedInput && inputEl) inputEl.value = savedInput;
      if (savedSecret && secretEl) secretEl.value = savedSecret;
      if (savedInput) processJWT();
    }
  }

  init();

})();