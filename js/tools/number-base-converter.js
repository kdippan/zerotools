/**
 * ZeroTools - Number Base Converter
 * File: js/tools/number-base-converter.js
 */

(function () {
  const TOOL_ID = 'number-base-converter';

  // --- DOM Elements ---
  const numberInputEl = document.getElementById('number-input');
  const inputBaseSelectEl = document.getElementById('input-base');
  const bitLengthSelectEl = document.getElementById('bit-length');

  const outBinaryEl = document.getElementById('out-binary');
  const outOctalEl = document.getElementById('out-octal');
  const outDecimalEl = document.getElementById('out-decimal');
  const outHexEl = document.getElementById('out-hex');
  const outBase32El = document.getElementById('out-base32');
  const outBase64El = document.getElementById('out-base64');

  const btnCopyBinary = document.getElementById('btn-copy-binary');
  const btnCopyOctal = document.getElementById('btn-copy-octal');
  const btnCopyDecimal = document.getElementById('btn-copy-decimal');
  const btnCopyHex = document.getElementById('btn-copy-hex');
  const btnCopyBase32 = document.getElementById('btn-copy-base32');
  const btnCopyBase64 = document.getElementById('btn-copy-base64');
  const btnClear = document.getElementById('btn-clear');
  const statusEl = document.getElementById('status');

  // --- Constants & Config ---
  const BASE32_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const BASE64_ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';

  // --- Core Math/Conversion Logic using BigInt for safety ---

  function parseInput(value, base) {
    if (!value) return null;
    
    // Clean input based on base
    let cleanVal = value.trim();
    if (base === 16) cleanVal = cleanVal.replace(/^0x/i, '');
    if (base === 8) cleanVal = cleanVal.replace(/^0o/i, '');
    if (base === 2) cleanVal = cleanVal.replace(/^0b/i, '');

    // Allow negative sign for decimal (others are usually treated as raw bits, but we'll support generic negative)
    const isNegative = cleanVal.startsWith('-');
    if (isNegative) cleanVal = cleanVal.substring(1);

    if (!cleanVal) return null;

    try {
      // Validate characters against base before parsing to avoid generic BigInt SyntaxError
      const validChars = getValidCharsForBase(base);
      const regex = new RegExp(`^[${validChars}]+$`, 'i');
      if (!regex.test(cleanVal)) throw new Error('Invalid characters for base');

      let bigIntValue = BigInt(0);
      
      if (base === 10 || base === 16 || base === 8 || base === 2) {
        // BigInt natively parses these prefixes
        const prefix = base === 16 ? '0x' : (base === 8 ? '0o' : (base === 2 ? '0b' : ''));
        bigIntValue = BigInt(`${isNegative ? '-' : ''}${prefix}${cleanVal}`);
      } else {
        throw new Error('Unsupported input base parsing');
      }

      return bigIntValue;

    } catch (e) {
      return { error: true };
    }
  }

  function getValidCharsForBase(base) {
    if (base === 2) return '01';
    if (base === 8) return '0-7';
    if (base === 10) return '0-9';
    if (base === 16) return '0-9A-Fa-f';
    return '';
  }

  function toTwoComplementHex(bigIntVal, bitLength) {
     if (bigIntVal >= BigInt(0)) {
         let hex = bigIntVal.toString(16).toUpperCase();
         return hex.padStart(bitLength / 4, '0');
     }
     
     // Handle negative two's complement
     const limit = BigInt(1) << BigInt(bitLength);
     const wrapped = limit + bigIntVal; // limit - abs(val)
     
     // Detect overflow/underflow
     if (wrapped < BigInt(0)) return 'OVERFLOW';
     
     return wrapped.toString(16).toUpperCase();
  }

  function toTwoComplementBinary(bigIntVal, bitLength) {
     if (bigIntVal >= BigInt(0)) {
         let bin = bigIntVal.toString(2);
         return bin.padStart(bitLength, '0');
     }
     const limit = BigInt(1) << BigInt(bitLength);
     const wrapped = limit + bigIntVal;
     if (wrapped < BigInt(0)) return 'OVERFLOW';
     return wrapped.toString(2);
  }

  // --- Custom Base Encoders (for positive integers generally, representing raw bits) ---
  
  function bigIntToBase32(bigIntVal) {
    if (bigIntVal < BigInt(0)) return 'N/A (Positives only)';
    if (bigIntVal === BigInt(0)) return BASE32_ALPHABET[0];
    
    let result = '';
    let val = bigIntVal;
    const base = BigInt(32);
    
    while (val > BigInt(0)) {
      const remainder = Number(val % base);
      result = BASE32_ALPHABET[remainder] + result;
      val = val / base;
    }
    return result;
  }

  function bigIntToBase64(bigIntVal) {
    if (bigIntVal < BigInt(0)) return 'N/A (Positives only)';
    if (bigIntVal === BigInt(0)) return BASE64_ALPHABET[0];
    
    let result = '';
    let val = bigIntVal;
    const base = BigInt(64);
    
    while (val > BigInt(0)) {
      const remainder = Number(val % base);
      result = BASE64_ALPHABET[remainder] + result;
      val = val / base;
    }
    return result;
  }

  // --- UI Update Logic ---

  function clearOutputs() {
    [outBinaryEl, outOctalEl, outDecimalEl, outHexEl, outBase32El, outBase64El].forEach(el => {
      if (el) {
        el.value = '';
        el.style.color = 'var(--text-primary)';
      }
    });
    if (statusEl) statusEl.innerHTML = '';
  }

  function showFormatError() {
    [outBinaryEl, outOctalEl, outDecimalEl, outHexEl, outBase32El, outBase64El].forEach(el => {
      if (el) {
        el.value = 'Invalid Input';
        el.style.color = 'var(--color-error)';
      }
    });
    if (statusEl) statusEl.innerHTML = `<span style="color: var(--color-error);">✗ Error: Invalid characters for selected base.</span>`;
  }

  function highlightOverflow(el, bitLength) {
    if (el.value === 'OVERFLOW') {
       el.value = `Error: Cannot fit in ${bitLength}-bit`;
       el.style.color = 'var(--color-error)';
    } else {
       el.style.color = 'var(--text-primary)';
    }
  }

  function processConversion() {
    if (!numberInputEl) return;
    
    const rawValue = numberInputEl.value;
    if (!rawValue.trim()) {
      clearOutputs();
      return;
    }

    const inputBase = parseInt(inputBaseSelectEl.value, 10);
    const bitLength = parseInt(bitLengthSelectEl.value, 10);

    const parsed = parseInput(rawValue, inputBase);

    if (!parsed) {
      clearOutputs();
      return;
    }

    if (parsed.error) {
      showFormatError();
      return;
    }

    const val = parsed; // The BigInt value

    // 1. Decimal
    if (outDecimalEl) outDecimalEl.value = val.toString(10);

    // 2. Hexadecimal (Two's complement respecting bit length)
    if (outHexEl) {
      outHexEl.value = toTwoComplementHex(val, bitLength);
      highlightOverflow(outHexEl, bitLength);
    }

    // 3. Binary (Two's complement respecting bit length)
    if (outBinaryEl) {
      let binStr = toTwoComplementBinary(val, bitLength);
      // Format with spaces every 8 bits for readability if it's long enough
      if (binStr !== 'OVERFLOW' && binStr.length > 8) {
         binStr = binStr.match(/.{1,8}/g).join(' ');
      }
      outBinaryEl.value = binStr;
      highlightOverflow(outBinaryEl, bitLength);
    }

    // 4. Octal (Direct mathematical, usually positive only used in modern dev)
    if (outOctalEl) {
       if (val < BigInt(0)) {
           outOctalEl.value = '-' + (-val).toString(8);
       } else {
           outOctalEl.value = val.toString(8);
       }
       outOctalEl.style.color = 'var(--text-primary)';
    }

    // 5. Custom Base 32 / 64
    if (outBase32El) {
      outBase32El.value = bigIntToBase32(val);
      outBase32El.style.color = val < 0 ? 'var(--text-tertiary)' : 'var(--text-primary)';
    }
    
    if (outBase64El) {
      outBase64El.value = bigIntToBase64(val);
      outBase64El.style.color = val < 0 ? 'var(--text-tertiary)' : 'var(--text-primary)';
    }

    if (statusEl) {
      statusEl.innerHTML = `<span style="color: var(--color-success);">✓ Parsed successfully</span> as Base ${inputBase}`;
    }

    saveState();
  }

  // --- Event Listeners ---

  if (numberInputEl) {
    numberInputEl.addEventListener('input', processConversion);
  }

  [inputBaseSelectEl, bitLengthSelectEl].forEach(el => {
    if (el) el.addEventListener('change', processConversion);
  });

  if (btnClear) {
    btnClear.addEventListener('click', () => {
      if (numberInputEl) numberInputEl.value = '';
      clearOutputs();
      if (numberInputEl) numberInputEl.focus();
      
      if (typeof window.saveToolInput === 'function') {
        window.saveToolInput(TOOL_ID, '');
      }
    });
  }

  // Setup Reverse-Click (Clicking an output makes it the input)
  const outputConfigs = [
    { el: outBinaryEl, base: 2 },
    { el: outOctalEl, base: 8 },
    { el: outDecimalEl, base: 10 },
    { el: outHexEl, base: 16 }
  ];

  outputConfigs.forEach(({ el, base }) => {
    if (el) {
      el.addEventListener('click', (e) => {
        if (!e.target.value || e.target.value.includes('Error') || e.target.value.includes('N/A')) return;
        
        // Strip spaces used for visual grouping in binary
        const val = e.target.value.replace(/\s+/g, '');
        
        if (numberInputEl) numberInputEl.value = val;
        if (inputBaseSelectEl) inputBaseSelectEl.value = base.toString();
        processConversion();
        
        if (typeof window.showToast === 'function') {
           window.showToast(`Input switched to Base ${base}`);
        }
      });
    }
  });

  // Copy Buttons
  const copyActions = [
    { btn: btnCopyBinary, input: outBinaryEl },
    { btn: btnCopyOctal, input: outOctalEl },
    { btn: btnCopyDecimal, input: outDecimalEl },
    { btn: btnCopyHex, input: outHexEl },
    { btn: btnCopyBase32, input: outBase32El },
    { btn: btnCopyBase64, input: outBase64El }
  ];

  copyActions.forEach(({ btn, input }) => {
    if (btn && input) {
      btn.addEventListener('click', () => {
        const val = input.value.replace(/\s+/g, ''); // Strip visual spaces before copy
        if (!val || val.includes('Error') || val.includes('N/A')) return;
        
        if (typeof window.copyToClipboard === 'function') {
          window.copyToClipboard(val, btn);
        } else {
          navigator.clipboard.writeText(val);
        }
        if (typeof window.trackCopy === 'function') window.trackCopy(TOOL_ID);
      });
    }
  });

  // --- State Management ---
  function saveState() {
    if (typeof window.saveToolInput !== 'function') return;
    
    if (numberInputEl) window.saveToolInput(TOOL_ID + '-input', numberInputEl.value);
    
    const opts = {
      base: inputBaseSelectEl ? inputBaseSelectEl.value : '10',
      bits: bitLengthSelectEl ? bitLengthSelectEl.value : '32'
    };
    window.saveToolInput(TOOL_ID + '-options', JSON.stringify(opts));
  }

  function loadState() {
    if (typeof window.loadToolInput !== 'function') return false;
    
    const savedInput = window.loadToolInput(TOOL_ID + '-input');
    const savedOptions = window.loadToolInput(TOOL_ID + '-options');

    if (savedInput && numberInputEl) numberInputEl.value = savedInput;

    if (savedOptions) {
      try {
        const opts = JSON.parse(savedOptions);
        if (inputBaseSelectEl) inputBaseSelectEl.value = opts.base;
        if (bitLengthSelectEl) bitLengthSelectEl.value = opts.bits;
      } catch (e) {
        // silent fail
      }
    }
    
    return savedInput !== null;
  }

  // --- Initialization ---
  function init() {
    if (loadState()) {
      processConversion();
    }
  }

  init();

})();