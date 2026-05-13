/**
 * ZeroTools - Secure Password Generator
 * File: js/tools/password-generator.js
 */

(function () {
  const TOOL_ID = 'password-generator';

  // --- DOM Elements ---
  const passwordDisplayEl = document.getElementById('password-display');
  const strengthBarEl = document.getElementById('strength-bar');
  const strengthLabelEl = document.getElementById('strength-label');
  
  const lengthSliderEl = document.getElementById('length-slider');
  const lengthDisplayEl = document.getElementById('length-display');
  const bulkCountEl = document.getElementById('bulk-count');
  
  const optUpperEl = document.getElementById('opt-upper');
  const optLowerEl = document.getElementById('opt-lower');
  const optNumbersEl = document.getElementById('opt-numbers');
  const optSymbolsEl = document.getElementById('opt-symbols');
  const optNoAmbiguousEl = document.getElementById('opt-noambiguous');

  const btnRegenerate = document.getElementById('btn-regenerate');
  const btnCopy = document.getElementById('btn-copy');
  const btnBulkGenerate = document.getElementById('btn-bulk-generate');
  const bulkOutputContainer = document.getElementById('bulk-output-container');

  // --- Constants ---
  const CHAR_SETS = {
    upper: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    lower: 'abcdefghijklmnopqrstuvwxyz',
    numbers: '0123456789',
    symbols: '!@#$%^&*()-_=+[]{}|;:,.<>?',
    ambiguous: /[0O1lI]/g
  };

  // --- Core Processing Logic ---

  function calculateEntropy(length, charsetSize) {
    if (charsetSize === 0 || length === 0) return 0;
    return length * Math.log2(charsetSize);
  }

  function updateStrengthMeter(password, options) {
    if (!strengthBarEl || !strengthLabelEl) return;

    let charsetSize = 0;
    if (options.upper) charsetSize += 26;
    if (options.lower) charsetSize += 26;
    if (options.numbers) charsetSize += 10;
    if (options.symbols) charsetSize += 26;
    if (options.noAmbiguous) {
       // Rough approximation: remove 5 chars from total set
       charsetSize = Math.max(1, charsetSize - 5); 
    }

    const entropy = calculateEntropy(password.length, charsetSize);
    
    let score = 0; // 0-4
    let label = 'Very Weak';
    let color = 'var(--color-error)';
    let width = '20%';

    if (entropy > 100) {
      score = 4; label = 'Very Strong'; color = '#8b5cf6'; width = '100%';
    } else if (entropy > 75) {
      score = 3; label = 'Strong'; color = 'var(--color-success)'; width = '75%';
    } else if (entropy > 50) {
      score = 2; label = 'Good'; color = 'var(--color-info)'; width = '50%';
    } else if (entropy > 30) {
      score = 1; label = 'Weak'; color = 'var(--color-warning)'; width = '35%';
    }

    // Edge case: if length is good but only one charset selected, cap strength
    if (password.length >= 16 && charsetSize <= 10) {
      score = Math.min(score, 2);
      label = 'Fair (Increase variety)';
      color = 'var(--color-info)';
      width = '50%';
    }

    strengthBarEl.style.width = width;
    strengthBarEl.style.backgroundColor = color;
    strengthLabelEl.textContent = `${label} (${Math.round(entropy)} bits)`;
    strengthLabelEl.style.color = color;
  }

  function getOptions() {
    return {
      length: parseInt(lengthSliderEl ? lengthSliderEl.value : 16, 10),
      upper: optUpperEl ? optUpperEl.checked : true,
      lower: optLowerEl ? optLowerEl.checked : true,
      numbers: optNumbersEl ? optNumbersEl.checked : true,
      symbols: optSymbolsEl ? optSymbolsEl.checked : true,
      noAmbiguous: optNoAmbiguousEl ? optNoAmbiguousEl.checked : false
    };
  }

  function generatePasswordString(opts) {
    let chars = '';
    if (opts.upper) chars += CHAR_SETS.upper;
    if (opts.lower) chars += CHAR_SETS.lower;
    if (opts.numbers) chars += CHAR_SETS.numbers;
    if (opts.symbols) chars += CHAR_SETS.symbols;
    
    if (chars === '') {
      // Fallback if user unchecks everything
      chars = CHAR_SETS.lower;
      if (optLowerEl) optLowerEl.checked = true;
    }

    if (opts.noAmbiguous) {
      chars = chars.replace(CHAR_SETS.ambiguous, '');
    }

    const bytes = crypto.getRandomValues(new Uint8Array(opts.length));
    let password = '';
    for (let i = 0; i < bytes.length; i++) {
      password += chars[bytes[i] % chars.length];
    }

    // Ensure at least one character from each selected set exists in the final string
    // to prevent edge cases in short passwords where randomness skips a required set.
    // (Implementation omitted to keep pure mathematically random selection, 
    //  but noted as a common requirement in enterprise generators).

    return password;
  }

  function processSingle() {
    const opts = getOptions();
    const newPassword = generatePasswordString(opts);
    
    if (passwordDisplayEl) {
      passwordDisplayEl.textContent = newPassword;
    }
    
    updateStrengthMeter(newPassword, opts);
    saveState();
  }

  function processBulk() {
    const opts = getOptions();
    let count = parseInt(bulkCountEl ? bulkCountEl.value : 10, 10);
    if (isNaN(count) || count < 1) count = 1;
    if (count > 500) count = 500; // Sane limit for DOM rendering

    if (!bulkOutputContainer) return;
    
    bulkOutputContainer.innerHTML = '';
    bulkOutputContainer.style.display = 'flex';
    bulkOutputContainer.style.flexDirection = 'column';
    bulkOutputContainer.style.gap = 'var(--space-2)';
    bulkOutputContainer.style.marginTop = 'var(--space-6)';

    const fragment = document.createDocumentFragment();

    for (let i = 0; i < count; i++) {
      const pwd = generatePasswordString(opts);
      
      const row = document.createElement('div');
      row.style.display = 'flex';
      row.style.justifyContent = 'space-between';
      row.style.alignItems = 'center';
      row.style.padding = '8px 12px';
      row.style.background = 'var(--bg-tertiary)';
      row.style.border = '1px solid var(--border-default)';
      row.style.borderRadius = 'var(--radius-sm)';

      const text = document.createElement('span');
      text.style.fontFamily = 'var(--font-mono)';
      text.style.fontSize = 'var(--text-base)';
      text.style.color = 'var(--text-primary)';
      text.style.userSelect = 'all';
      text.textContent = pwd;

      const copyBtn = document.createElement('button');
      copyBtn.className = 'btn-ghost';
      copyBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
      copyBtn.title = 'Copy';
      
      copyBtn.onclick = () => {
        if (typeof window.copyToClipboard === 'function') {
          window.copyToClipboard(pwd, copyBtn);
          copyBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--color-success)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
          setTimeout(() => {
            copyBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>';
          }, 2000);
        } else {
          navigator.clipboard.writeText(pwd);
        }
      };

      row.appendChild(text);
      row.appendChild(copyBtn);
      fragment.appendChild(row);
    }

    bulkOutputContainer.appendChild(fragment);
    
    if (typeof window.trackToolUse === 'function') window.trackToolUse(TOOL_ID + '-bulk');
  }

  // --- State Management ---
  function saveState() {
    if (typeof window.saveToolInput !== 'function') return;
    
    const state = {
      length: lengthSliderEl ? lengthSliderEl.value : 16,
      upper: optUpperEl ? optUpperEl.checked : true,
      lower: optLowerEl ? optLowerEl.checked : true,
      numbers: optNumbersEl ? optNumbersEl.checked : true,
      symbols: optSymbolsEl ? optSymbolsEl.checked : true,
      noAmbiguous: optNoAmbiguousEl ? optNoAmbiguousEl.checked : false
    };
    
    window.saveToolInput(TOOL_ID + '-options', JSON.stringify(state));
  }

  function loadState() {
    if (typeof window.loadToolInput !== 'function') return false;
    
    const saved = window.loadToolInput(TOOL_ID + '-options');
    if (!saved) return false;

    try {
      const state = JSON.parse(saved);
      if (lengthSliderEl && state.length) {
        lengthSliderEl.value = state.length;
        if (lengthDisplayEl) lengthDisplayEl.textContent = state.length;
      }
      if (optUpperEl) optUpperEl.checked = state.upper;
      if (optLowerEl) optLowerEl.checked = state.lower;
      if (optNumbersEl) optNumbersEl.checked = state.numbers;
      if (optSymbolsEl) optSymbolsEl.checked = state.symbols;
      if (optNoAmbiguousEl) optNoAmbiguousEl.checked = state.noAmbiguous;
      return true;
    } catch (e) {
      return false;
    }
  }

  // --- Event Listeners ---

  if (lengthSliderEl) {
    lengthSliderEl.addEventListener('input', (e) => {
      if (lengthDisplayEl) lengthDisplayEl.textContent = e.target.value;
      processSingle();
    });
  }

  [optUpperEl, optLowerEl, optNumbersEl, optSymbolsEl, optNoAmbiguousEl].forEach(el => {
    if (el) el.addEventListener('change', processSingle);
  });

  if (btnRegenerate) {
    btnRegenerate.addEventListener('click', () => {
      processSingle();
      if (typeof window.trackToolUse === 'function') window.trackToolUse(TOOL_ID);
    });
  }

  if (btnCopy && passwordDisplayEl) {
    btnCopy.addEventListener('click', () => {
      const pwd = passwordDisplayEl.textContent;
      if (!pwd) return;
      
      if (typeof window.copyToClipboard === 'function') {
        window.copyToClipboard(pwd, btnCopy);
      } else {
        navigator.clipboard.writeText(pwd);
      }
      if (typeof window.trackCopy === 'function') window.trackCopy(TOOL_ID);
    });
  }

  if (btnBulkGenerate) {
    btnBulkGenerate.addEventListener('click', processBulk);
  }

  // --- Initialization ---
  function init() {
    loadState();
    processSingle();
  }

  init();

})();