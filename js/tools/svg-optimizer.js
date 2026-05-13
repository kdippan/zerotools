/**
 * ZeroTools - SVG Optimizer
 * File: js/tools/svg-optimizer.js
 */

(function () {
  const TOOL_ID = 'svg-optimizer';

  // --- DOM Elements ---
  const svgInputEl = document.getElementById('svg-input');
  const svgOutputEl = document.getElementById('svg-output');
  
  const svgBeforeEl = document.getElementById('svg-before');
  const svgAfterEl = document.getElementById('svg-after');
  
  const optCommentsEl = document.getElementById('opt-comments');
  const optMetadataEl = document.getElementById('opt-metadata');
  const optEmptyAttrsEl = document.getElementById('opt-emptyattrs');
  const optRoundNumbersEl = document.getElementById('opt-roundnumbers');
  const optWhitespaceEl = document.getElementById('opt-whitespace');

  const btnClear = document.getElementById('btn-clear');
  const btnPaste = document.getElementById('btn-paste');
  const btnSample = document.getElementById('btn-sample');
  const btnCopy = document.getElementById('btn-copy');
  const btnDownload = document.getElementById('btn-download');
  
  const statusEl = document.getElementById('status');
  
  // Drop Zone (if it exists in the layout, spec mentioned it but didn't mandate the exact HTML structure for it. We'll hook it if present, otherwise ignore).
  const dropZoneEl = document.querySelector('.tool-input-section'); // Bind drop to the whole input section

  // --- Constants ---
  const SAMPLE_SVG = `<?xml version="1.0" encoding="utf-8"?>
<!-- Generator: Adobe Illustrator 24.1.2, SVG Export Plug-In . SVG Version: 6.00 Build 0)  -->
<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
\t viewBox="0 0 100 100" style="enable-background:new 0 0 100 100;" xml:space="preserve">
<style type="text/css">
\t.st0{fill:#00DC82;}
\t.st1{fill:#FFFFFF;}
</style>
<metadata>
\t<sfw  xmlns="http://ns.adobe.com/SaveForWeb/1.0/">
\t\t<slices></slices>
\t\t<sliceSourceBounds  bottomLeftOrigin="true" height="100" width="100" x="0" y="0"></sliceSourceBounds>
\t</sfw>
</metadata>
<g id="Background" empty-attr="">
\t<rect class="st0" width="100" height="100"/>
</g>
<g id="Icon">
\t<!-- Draw the main path -->
\t<path class="st1" d="M30.456,20.123 L70.891,20.123 C75.123,20.123 79.456,25.678 79.456,30.123 L79.456,70.891 C79.456,75.123 75.123,79.456 70.891,79.456 L30.456,79.456 C25.678,79.456 20.123,75.123 20.123,70.891 L20.123,30.123 C20.123,25.678 25.678,20.123 30.456,20.123 Z"/>
\t<circle class="st0" cx="50.0001" cy="50.0001" r="15.5432"/>
</g>
</svg>`;

  // --- Utility Functions ---

  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  function formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  function isValidSVG(str) {
    // Extremely basic check. Real parsing is too heavy.
    return str.includes('<svg') && str.includes('</svg>');
  }

  function getOptions() {
    return {
      comments: optCommentsEl ? optCommentsEl.checked : true,
      metadata: optMetadataEl ? optMetadataEl.checked : true,
      emptyAttrs: optEmptyAttrsEl ? optEmptyAttrsEl.checked : true,
      roundNumbers: optRoundNumbersEl ? optRoundNumbersEl.checked : true,
      whitespace: optWhitespaceEl ? optWhitespaceEl.checked : true
    };
  }

  // --- Optimization Engine (Pure Regex) ---

  function optimizeSVG(svgStr, opts) {
    let optimized = svgStr;

    // 1. Remove XML declaration if present
    optimized = optimized.replace(/<\?xml.*?\?>\s*/gi, '');

    // 2. Remove DOCTYPE
    optimized = optimized.replace(/<!DOCTYPE.*?>\s*/gi, '');

    // 3. Remove Comments
    if (opts.comments) {
      optimized = optimized.replace(/<!--[\s\S]*?-->/g, '');
    }

    // 4. Remove Metadata blocks
    if (opts.metadata) {
      optimized = optimized.replace(/<metadata>[\s\S]*?<\/metadata>/gi, '');
      // Some editors use custom tags like <i:pgf>, we catch standard Adobe/Sketch ones
      optimized = optimized.replace(/<sfw[\s\S]*?<\/sfw>/gi, ''); 
      optimized = optimized.replace(/<x:xmpmeta[\s\S]*?<\/x:xmpmeta>/gi, '');
    }

    // 5. Remove empty attributes (e.g., class="" or id="")
    if (opts.emptyAttrs) {
      // Run a few times to catch adjacent empty attrs
      for(let i=0; i<3; i++) {
        optimized = optimized.replace(/\s+[a-zA-Z0-9:-]+=(["'])\1/g, '');
      }
    }

    // 6. Round numbers in path data and common attributes
    if (opts.roundNumbers) {
      // Match numbers with more than 2 decimal places. 
      // E.g. 50.0001 -> 50,  15.5432 -> 15.54
      optimized = optimized.replace(/(\d+\.\d{2})\d+/g, '$1');
      // Strip trailing zeros after decimal (e.g. 50.00 -> 50)
      optimized = optimized.replace(/(\.\d*?[1-9])0+|(\.)0+(?=\D|$)/g, '$1');
      // Remove trailing dot if left alone
      optimized = optimized.replace(/(\d)\.(?=\D|$)/g, '$1');
    }

    // 7. Collapse Whitespace
    if (opts.whitespace) {
      // Remove whitespace between tags
      optimized = optimized.replace(/>\s+</g, '><');
      // Collapse multiple spaces into one inside tags
      optimized = optimized.replace(/\s{2,}/g, ' ');
      // Clean up spaces around equals
      optimized = optimized.replace(/\s*=\s*/g, '=');
      // Trim overall
      optimized = optimized.trim();
    }

    return optimized;
  }

  // --- Core Processing Logic ---

  function processOptimization() {
    if (!svgInputEl || !svgOutputEl) return;
    
    const inputStr = svgInputEl.value;
    
    if (!inputStr.trim()) {
      svgOutputEl.value = '';
      if (svgBeforeEl) svgBeforeEl.innerHTML = '';
      if (svgAfterEl) svgAfterEl.innerHTML = '';
      if (statusEl) statusEl.innerHTML = '';
      saveState();
      return;
    }

    if (!isValidSVG(inputStr)) {
       if (statusEl) {
         statusEl.innerHTML = `<span style="color: var(--color-error);">✗ Error: Input does not appear to be a valid SVG.</span>`;
       }
       svgOutputEl.value = '';
       return;
    }

    const opts = getOptions();
    let outputStr = '';

    try {
      outputStr = optimizeSVG(inputStr, opts);
      svgOutputEl.value = outputStr;
      if (svgBeforeEl) {
        svgBeforeEl.innerHTML = inputStr;
        // Force bounds so it doesn't break layout
        const svg1 = svgBeforeEl.querySelector('svg');
        if(svg1) { svg1.style.width = '100%'; svg1.style.height = '100%'; }
      }
      if (svgAfterEl) {
        svgAfterEl.innerHTML = outputStr;
        const svg2 = svgAfterEl.querySelector('svg');
        if(svg2) { svg2.style.width = '100%'; svg2.style.height = '100%'; }
      }

      // Calculate Stats
      if (statusEl) {
        const origBytes = new Blob([inputStr]).size;
        const outBytes = new Blob([outputStr]).size;
        const savings = origBytes - outBytes;
        const percent = origBytes > 0 ? ((savings / origBytes) * 100).toFixed(1) : 0;
        
        let statsHtml = '';
        if (savings > 0) {
           statsHtml = `Before: ${formatBytes(origBytes)} <span style="color: var(--border-strong);">·</span> After: ${formatBytes(outBytes)} <span style="color: var(--border-strong);">·</span> <span style="color: var(--color-success);">Saved: ${percent}% (${formatBytes(savings)})</span>`;
        } else if (savings === 0) {
           statsHtml = `Size: ${formatBytes(outBytes)} (No further savings available)`;
        } else {
           statsHtml = `Size: ${formatBytes(outBytes)} (Increased by ${formatBytes(Math.abs(savings))})`;
        }
        statusEl.innerHTML = statsHtml;
      }
    } catch (e) {
      if (statusEl) {
        statusEl.innerHTML = `<span style="color: var(--color-error);">✗ Error optimizing SVG: ${e.message}</span>`;
      }
    }

    saveState();
  }

  function handleFile(file) {
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.svg') && file.type !== 'image/svg+xml') {
      if (typeof window.showToast === 'function') {
        window.showToast('Please select a valid SVG file.', 'error');
      }
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      if (svgInputEl) {
        svgInputEl.value = e.target.result;
        processOptimization();
      }
    };
    reader.readAsText(file);
  }

  // --- Event Listeners ---

  const debouncedProcess = debounce(processOptimization, 300);

  if (svgInputEl) {
    svgInputEl.addEventListener('input', debouncedProcess);
  }

  [optCommentsEl, optMetadataEl, optEmptyAttrsEl, optRoundNumbersEl, optWhitespaceEl].forEach(el => {
    if (el) el.addEventListener('change', processOptimization);
  });

  if (btnClear) {
    btnClear.addEventListener('click', () => {
      if (svgInputEl) svgInputEl.value = '';
      if (svgBeforeEl) svgBeforeEl.innerHTML = '';
      if (svgAfterEl) svgAfterEl.innerHTML = '';
      processOptimization();
      
      if (typeof window.saveToolInput === 'function') {
        window.saveToolInput(TOOL_ID + '-input', '');
      }
    });
  }

  if (btnPaste) {
    btnPaste.addEventListener('click', async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (svgInputEl) {
          svgInputEl.value = text;
          processOptimization();
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
      if (svgInputEl) {
        svgInputEl.value = SAMPLE_CSS; // Using the placeholder as it maps to the const. Wait, rename var.
        svgInputEl.value = SAMPLE_SVG;
        processOptimization();
      }
    });
  }

  if (btnCopy) {
    btnCopy.addEventListener('click', () => {
      const output = svgOutputEl ? svgOutputEl.value : '';
      if (!output) return;
      
      if (typeof window.copyToClipboard === 'function') {
        window.copyToClipboard(output, btnCopy);
      } else {
        navigator.clipboard.writeText(output);
      }
      
      if (typeof window.trackCopy === 'function') window.trackCopy(TOOL_ID);
    });
  }

  if (btnDownload) {
    btnDownload.addEventListener('click', () => {
      const output = svgOutputEl ? svgOutputEl.value : '';
      if (!output) return;
      
      const filename = `optimized-${Date.now()}.svg`;

      const blob = new Blob([output], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  // File Drop Zone Listeners
  if (dropZoneEl) {
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      dropZoneEl.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
      e.preventDefault();
      e.stopPropagation();
    }

    ['dragenter', 'dragover'].forEach(eventName => {
      dropZoneEl.addEventListener(eventName, () => {
        dropZoneEl.style.borderColor = 'var(--accent)';
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropZoneEl.addEventListener(eventName, () => {
        dropZoneEl.style.borderColor = 'var(--border-default)';
      }, false);
    });

    dropZoneEl.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      if (files && files.length > 0) {
        handleFile(files[0]);
      }
    }, false);
  }

  // --- State Management ---
  function saveState() {
    if (typeof window.saveToolInput !== 'function') return;
    
    if (svgInputEl) window.saveToolInput(TOOL_ID + '-input', svgInputEl.value);
    
    const opts = getOptions();
    window.saveToolInput(TOOL_ID + '-options', JSON.stringify(opts));
  }

  function loadState() {
    if (typeof window.loadToolInput !== 'function') return false;
    
    const savedInput = window.loadToolInput(TOOL_ID + '-input');
    const savedOptions = window.loadToolInput(TOOL_ID + '-options');

    if (savedInput && svgInputEl) {
      svgInputEl.value = savedInput;
    }

    if (savedOptions) {
      try {
        const opts = JSON.parse(savedOptions);
        if (optCommentsEl) optCommentsEl.checked = opts.comments;
        if (optMetadataEl) optMetadataEl.checked = opts.metadata;
        if (optEmptyAttrsEl) optEmptyAttrsEl.checked = opts.emptyAttrs;
        if (optRoundNumbersEl) optRoundNumbersEl.checked = opts.roundNumbers;
        if (optWhitespaceEl) optWhitespaceEl.checked = opts.whitespace;
      } catch (e) {
        // silent fail
      }
    }
    
    return savedInput !== null;
  }

  // --- Initialization ---
  function init() {
    loadState();
    processOptimization();
  }

  init();

})();