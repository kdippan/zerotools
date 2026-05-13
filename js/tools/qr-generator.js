/**
 * ZeroTools - QR Code Generator
 * File: js/tools/qr-generator.js
 */

(function () {
  const TOOL_ID = 'qr-generator';

  // --- DOM Elements ---
  const inputEl = document.getElementById('input');
  const outputEl = document.getElementById('output');
  const statusEl = document.getElementById('status');
  
  const sizeSelectEl = document.getElementById('qr-size');
  const eclSelectEl = document.getElementById('qr-ecl');
  const fgColorEl = document.getElementById('qr-fg');
  const bgColorEl = document.getElementById('qr-bg');
  const presetSelectEl = document.getElementById('preset-select');

  const btnRun = document.getElementById('btn-run');
  const btnClear = document.getElementById('btn-clear');
  const btnPaste = document.getElementById('btn-paste');
  const btnSample = document.getElementById('btn-sample');
  const btnDownloadPng = document.getElementById('btn-download-png');
  const btnDownloadSvg = document.getElementById('btn-download-svg');

  let currentQR = null;

  // --- Constants & Presets ---
  const PRESETS = {
    url: "https://zerotools-io.vercel.app/",
    text: "Privacy-first developer utilities. 100% client-side.",
    email: "mailto:dippan.connect@gmail.com?subject=Inquiry",
    phone: "tel:+18005550199",
    wifi: "WIFI:T:WPA;S:MyWiFiNetwork;P:SuperSecretPassword;H:false;;"
  };

  const ECL_MAP = {
    'L': 1, // QRCode.CorrectLevel.L
    'M': 0, // QRCode.CorrectLevel.M
    'Q': 3, // QRCode.CorrectLevel.Q
    'H': 2  // QRCode.CorrectLevel.H
  };

  // --- Utility Functions ---

  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  function getOptions() {
    return {
      size: parseInt(sizeSelectEl ? sizeSelectEl.value : 256, 10),
      ecl: eclSelectEl ? eclSelectEl.value : 'M',
      fg: fgColorEl ? fgColorEl.value : '#00dc82',
      bg: bgColorEl ? bgColorEl.value : '#0a0a0a'
    };
  }
  function generateSVGString(qrInstance, size, fg, bg) {
    const qrModel = qrInstance._oQRCode;
    if (!qrModel) return null;
    
    const count = qrModel.moduleCount;
    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${count} ${count}" width="${size}" height="${size}">\n`;
    svg += `  <rect width="${count}" height="${count}" fill="${bg}" />\n`;
    
    // Group all dark pixels into a single path for optimal SVG performance and rendering
    let pathData = '';
    for (let row = 0; row < count; row++) {
      for (let col = 0; col < count; col++) {
        if (qrModel.isDark(row, col)) {
          pathData += `M${col},${row}h1v1h-1z `;
        }
      }
    }
    
    if (pathData) {
      svg += `  <path d="${pathData.trim()}" fill="${fg}" />\n`;
    }
    
    svg += `</svg>`;
    return svg;
  }

  // --- Core Processing Logic ---

  function generateQRCode() {
    if (!outputEl) return;
    
    const text = inputEl.value.trim();
    const opts = getOptions();

    if (!text) {
      outputEl.innerHTML = '<div style="color: var(--text-tertiary); display: flex; align-items: center; justify-content: center; height: 100%;">QR code will appear here...</div>';
      outputEl.style.display = 'flex';
      outputEl.style.justifyContent = 'center';
      if (statusEl) statusEl.innerHTML = '';
      currentQR = null;
      return;
    }

    try {
      // Clear previous
      outputEl.innerHTML = '';
      outputEl.style.display = 'flex';
      outputEl.style.alignItems = 'center';
      outputEl.style.justifyContent = 'center';
      outputEl.style.padding = 'var(--space-6)';
      outputEl.style.backgroundColor = opts.bg; // Blend panel background with QR background
      
      const qrContainer = document.createElement('div');
      qrContainer.style.background = opts.bg;
      qrContainer.style.padding = '16px'; // Quiet zone wrapper
      qrContainer.style.borderRadius = 'var(--radius-sm)';
      
      // Setup QRCode.js parameters
      const qrConfig = {
        text: text,
        width: 256, // Fixed display size for UI consistency, download size is independent
        height: 256,
        colorDark: opts.fg,
        colorLight: opts.bg,
        correctLevel: ECL_MAP[opts.ecl] !== undefined ? ECL_MAP[opts.ecl] : 0
      };

      currentQR = new QRCode(qrContainer, qrConfig);
      outputEl.appendChild(qrContainer);

      // Status Bar logic
      if (statusEl) {
        const len = text.length;
        let warning = '';
        if (len > 300) {
           warning = `<span style="color: var(--color-warning); margin-left: 8px;">⚠ High density (May be hard to scan)</span>`;
        }
        statusEl.innerHTML = `<span style="color: var(--color-success);">✓ Generated</span> <span style="color: var(--border-strong);">·</span> ${len} characters ${warning}`;
      }

      saveState();

    } catch (e) {
      outputEl.innerHTML = '';
      outputEl.style.backgroundColor = 'var(--bg-tertiary)';
      if (statusEl) {
        statusEl.innerHTML = `<span style="color: var(--color-error);">✗ Error generating QR code: Input may be too large for selected Error Correction Level.</span>`;
      }
      currentQR = null;
    }
  }

  // --- Event Listeners ---

  const debouncedGenerate = debounce(generateQRCode, 300);

  if (inputEl) {
    inputEl.addEventListener('input', debouncedGenerate);
  }

  [sizeSelectEl, eclSelectEl, fgColorEl, bgColorEl].forEach(el => {
    if (el) el.addEventListener('change', generateQRCode);
  });

  if (presetSelectEl) {
    presetSelectEl.addEventListener('change', (e) => {
      const val = e.target.value;
      if (PRESETS[val] && inputEl) {
        inputEl.value = PRESETS[val];
        generateQRCode();
      }
      e.target.value = ""; // Reset select
    });
  }

  if (btnRun) {
    btnRun.addEventListener('click', () => {
      generateQRCode();
      if (typeof window.trackToolUse === 'function') window.trackToolUse(TOOL_ID);
    });
  }

  if (btnClear) {
    btnClear.addEventListener('click', () => {
      if (inputEl) inputEl.value = '';
      if (fgColorEl) fgColorEl.value = '#00dc82';
      if (bgColorEl) bgColorEl.value = '#0a0a0a';
      if (sizeSelectEl) sizeSelectEl.value = '512';
      if (eclSelectEl) eclSelectEl.value = 'M';
      
      outputEl.style.backgroundColor = 'var(--bg-tertiary)';
      
      generateQRCode();
      if (inputEl) inputEl.focus();
      
      if (typeof window.saveToolInput === 'function') {
        window.saveToolInput(TOOL_ID + '-input', '');
      }
    });
  }

  if (btnPaste) {
    btnPaste.addEventListener('click', async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (inputEl) {
          inputEl.value = text;
          generateQRCode();
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
      if (inputEl) inputEl.value = PRESETS.url;
      if (fgColorEl) fgColorEl.value = '#00dc82';
      if (bgColorEl) bgColorEl.value = '#0a0a0a';
      generateQRCode();
    });
  }

  if (btnDownloadPng) {
    btnDownloadPng.addEventListener('click', () => {
      if (!currentQR) return;
      
      const canvas = outputEl.querySelector('canvas');
      if (!canvas) {
         if (typeof window.showToast === 'function') window.showToast('Error: Canvas not found', 'error');
         return;
      }

      const opts = getOptions();
      const offlineCanvas = document.createElement('canvas');
      offlineCanvas.width = opts.size;
      offlineCanvas.height = opts.size;
      const ctx = offlineCanvas.getContext('2d');
      
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(canvas, 0, 0, opts.size, opts.size);

      const dataUrl = offlineCanvas.toDataURL('image/png');
      
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = `zerotools-qr-${Date.now()}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      if (typeof window.trackCopy === 'function') window.trackCopy(TOOL_ID + '-png');
    });
  }

  if (btnDownloadSvg) {
    btnDownloadSvg.addEventListener('click', () => {
      if (!currentQR) return;
      
      const opts = getOptions();
      const svgString = generateSVGString(currentQR, opts.size, opts.fg, opts.bg);
      
      if (!svgString) {
         if (typeof window.showToast === 'function') window.showToast('Error generating SVG', 'error');
         return;
      }

      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      
      a.href = url;
      a.download = `zerotools-qr-${Date.now()}.svg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      if (typeof window.trackCopy === 'function') window.trackCopy(TOOL_ID + '-svg');
    });
  }

  function saveState() {
    if (typeof window.saveToolInput !== 'function') return;
    
    if (inputEl) window.saveToolInput(TOOL_ID + '-input', inputEl.value);
    
    const opts = getOptions();
    window.saveToolInput(TOOL_ID + '-options', JSON.stringify(opts));
  }

  function loadState() {
    if (typeof window.loadToolInput !== 'function') return false;
    
    const savedInput = window.loadToolInput(TOOL_ID + '-input');
    const savedOptions = window.loadToolInput(TOOL_ID + '-options');

    if (savedInput && inputEl) {
      inputEl.value = savedInput;
    }

    if (savedOptions) {
      try {
        const opts = JSON.parse(savedOptions);
        if (sizeSelectEl) sizeSelectEl.value = opts.size;
        if (eclSelectEl) eclSelectEl.value = opts.ecl;
        if (fgColorEl) fgColorEl.value = opts.fg;
        if (bgColorEl) bgColorEl.value = opts.bg;
      } catch (e) {
      }
    }
    
    return savedInput !== null;
  }

  function init() {
    if (loadState()) {
      generateQRCode();
    } else {
      generateQRCode(); 
    }
  }
  if (typeof QRCode !== 'undefined') {
    init();
  } else {
    window.addEventListener('load', init);
  }

})();