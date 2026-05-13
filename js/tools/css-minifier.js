/**
 * ZeroTools - CSS Minifier & Beautifier
 * File: js/tools/css-minifier.js
 */

(function () {
  const TOOL_ID = 'css-minifier';

  // --- DOM Elements ---
  const cssInputEl = document.getElementById('css-input');
  const cssOutputEl = document.getElementById('css-output');
  
  const modeMinifyEl = document.getElementById('mode-minify');
  const modeBeautifyEl = document.getElementById('mode-beautify');
  
  const btnClear = document.getElementById('btn-clear');
  const btnPaste = document.getElementById('btn-paste');
  const btnSample = document.getElementById('btn-sample');
  const btnCopy = document.getElementById('btn-copy');
  const btnDownload = document.getElementById('btn-download');
  
  const statusEl = document.getElementById('status');

  // --- State ---
  let currentMode = 'minify'; // 'minify' or 'beautify'

  const SAMPLE_CSS = `/* 
  ZeroTools Sample CSS 
  Contains unnecessary whitespace, comments, and long units.
*/

:root {
    --main-bg-color: #0a0a0a;
    --accent-color: #00dc82;
}

body {
    background-color: var(--main-bg-color);
    color: #ffffff;
    margin: 0px;
    padding: 0px;
}

.container {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    /* Extra spacing below */
    
    
    height: 100vh;
}

button {
    border: none;
    padding: 10px 20px;
    background: var(--accent-color);
    font-weight: bold;
}

/* Hover state */
button:hover {
    opacity: 0.9;
}`;

  // --- Core Processing Logic ---

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

  function checkSyntaxBasics(cssStr) {
    // A very naive check for unmatched braces
    const openBraces = (cssStr.match(/\{/g) || []).length;
    const closeBraces = (cssStr.match(/\}/g) || []).length;
    if (openBraces !== closeBraces) {
      return `Warning: Unmatched braces detected ({: ${openBraces}, }: ${closeBraces})`;
    }
    return null;
  }

  function minifyCSS(css) {
    let minified = css;

    // 1. Remove comments (except special comments starting with /*!)
    minified = minified.replace(/\/\*(?!!)([\s\S]*?)\*\//g, '');
    
    // 2. Remove whitespace around structural characters { } ; : , > + ~
    // Note: Be careful with space around calc() or inside strings, but for basic minifier this works.
    minified = minified.replace(/\s*([\{\}\:\;\,>+~])\s*/g, '$1');
    
    // 3. Remove trailing semicolons before closing brace
    minified = minified.replace(/;\}/g, '}');
    
    // 4. Remove newlines and extra spaces
    minified = minified.replace(/\s+/g, ' ');
    
    // 5. Remove units from 0 values (0px, 0em, etc.)
    minified = minified.replace(/(^|[\s:;])0(?:px|em|rem|vh|vw|%|pt|pc|in|cm|mm|ex)/g, '$10');
    
    // 6. Simplify zero decimals (0.5s -> .5s)
    minified = minified.replace(/(^|[\s:;])0\./g, '$1.');

    // 7. Simplify hex colors (#aabbcc -> #abc) - complex to do safely without a full parser, skipping for safety in basic regex minifier.

    return minified.trim();
  }

  function beautifyCSS(css) {
    // Basic beautifier: expand blocks, indent, add spaces
    let beautiful = css;

    // Strip existing comments just to clean up before formatting (optional, but makes regex easier)
    // Actually, preserving comments is better, but hard with regex formatting. We'll leave them.
    
    // First, compress it all to a single line to normalize
    beautiful = beautiful.replace(/\s+/g, ' ');
    beautiful = beautiful.replace(/\s*([\{\}\:\;\,])\s*/g, '$1');

    // Now format
    let formatted = '';
    let indentLevel = 0;
    const indentString = '  '; // 2 spaces

    // Process character by character
    for (let i = 0; i < beautiful.length; i++) {
      let char = beautiful[i];

      if (char === '{') {
        formatted += ' {\n';
        indentLevel++;
        formatted += indentString.repeat(indentLevel);
      } else if (char === '}') {
        indentLevel--;
        formatted += '\n' + indentString.repeat(indentLevel) + '}\n\n';
      } else if (char === ';') {
        formatted += ';\n' + indentString.repeat(indentLevel);
      } else if (char === ':') {
        // Add space after colon, but careful not to add inside pseudo-classes
        // Naive check: if next char is not a brace or we are inside a rule
        if (indentLevel > 0) {
           formatted += ': ';
        } else {
           formatted += ':';
        }
      } else if (char === ',') {
         formatted += ', ';
      } else {
        formatted += char;
      }
    }

    // Clean up trailing whitespace and multiple newlines
    formatted = formatted.replace(/\n\s*\n/g, '\n\n').trim();
    
    return formatted;
  }

  function processCSS() {
    if (!cssInputEl || !cssOutputEl) return;
    
    const inputCSS = cssInputEl.value;
    
    if (!inputCSS.trim()) {
      cssOutputEl.value = '';
      if (statusEl) statusEl.innerHTML = '';
      saveState();
      return;
    }

    const syntaxWarning = checkSyntaxBasics(inputCSS);
    let outputCSS = '';

    try {
      if (currentMode === 'minify') {
        outputCSS = minifyCSS(inputCSS);
      } else {
        outputCSS = beautifyCSS(inputCSS);
      }
      
      cssOutputEl.value = outputCSS;

      if (statusEl) {
        const origBytes = new Blob([inputCSS]).size;
        const outBytes = new Blob([outputCSS]).size;
        
        let statsHtml = '';
        if (syntaxWarning) {
           statsHtml += `<span style="color: var(--color-warning); margin-right: 12px;">⚠ ${syntaxWarning}</span>`;
        }

        if (currentMode === 'minify') {
          const savings = origBytes - outBytes;
          const percent = origBytes > 0 ? ((savings / origBytes) * 100).toFixed(1) : 0;
          
          if (savings > 0) {
             statsHtml += `Before: ${formatBytes(origBytes)} <span style="color: var(--border-strong);">·</span> After: ${formatBytes(outBytes)} <span style="color: var(--border-strong);">·</span> <span style="color: var(--color-success);">Saved: ${percent}% (${formatBytes(savings)})</span>`;
          } else {
             statsHtml += `Size: ${formatBytes(outBytes)} (No savings)`;
          }
        } else {
           statsHtml += `Formatted Size: ${formatBytes(outBytes)}`;
        }

        statusEl.innerHTML = statsHtml;
      }
    } catch (e) {
      cssOutputEl.value = `/* Error processing CSS: ${e.message} */`;
      if (statusEl) statusEl.innerHTML = `<span style="color: var(--color-error);">✗ Processing failed</span>`;
    }

    saveState();
  }

  function updateMode(mode) {
    currentMode = mode;
    
    if (modeMinifyEl && modeBeautifyEl) {
      if (mode === 'minify') {
        modeMinifyEl.classList.add('active');
        modeMinifyEl.classList.remove('btn-ghost');
        modeMinifyEl.classList.add('btn-secondary');
        
        modeBeautifyEl.classList.remove('active');
        modeBeautifyEl.classList.add('btn-ghost');
        modeBeautifyEl.classList.remove('btn-secondary');
      } else {
        modeBeautifyEl.classList.add('active');
        modeBeautifyEl.classList.remove('btn-ghost');
        modeBeautifyEl.classList.add('btn-secondary');
        
        modeMinifyEl.classList.remove('active');
        modeMinifyEl.classList.add('btn-ghost');
        modeMinifyEl.classList.remove('btn-secondary');
      }
    }
    
    processCSS();
  }

  // --- Event Listeners ---

  const debouncedProcess = debounce(processCSS, 300);

  if (cssInputEl) {
    cssInputEl.addEventListener('input', debouncedProcess);
  }

  if (modeMinifyEl) modeMinifyEl.addEventListener('click', () => updateMode('minify'));
  if (modeBeautifyEl) modeBeautifyEl.addEventListener('click', () => updateMode('beautify'));

  if (btnClear) {
    btnClear.addEventListener('click', () => {
      if (cssInputEl) {
        cssInputEl.value = '';
        cssInputEl.focus();
      }
      processCSS();
      
      if (typeof window.saveToolInput === 'function') {
        window.saveToolInput(TOOL_ID, '');
      }
    });
  }

  if (btnPaste) {
    btnPaste.addEventListener('click', async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (cssInputEl) {
          cssInputEl.value = text;
          processCSS();
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
      if (cssInputEl) {
        cssInputEl.value = SAMPLE_CSS;
        updateMode('minify'); // Force minify for sample to show savings
      }
    });
  }

  if (btnCopy && cssOutputEl) {
    btnCopy.addEventListener('click', () => {
      const output = cssOutputEl.value;
      if (!output) return;
      
      if (typeof window.copyToClipboard === 'function') {
        window.copyToClipboard(output, btnCopy);
      } else {
        navigator.clipboard.writeText(output);
      }
      
      if (typeof window.trackCopy === 'function') window.trackCopy(TOOL_ID);
    });
  }

  if (btnDownload && cssOutputEl) {
    btnDownload.addEventListener('click', () => {
      const output = cssOutputEl.value;
      if (!output) return;
      
      const ext = currentMode === 'minify' ? '.min.css' : '.css';
      const filename = `style-${Date.now()}${ext}`;

      const blob = new Blob([output], { type: 'text/css' });
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

  // --- State Management ---
  function saveState() {
    if (typeof window.saveToolInput !== 'function') return;
    
    if (cssInputEl) window.saveToolInput(TOOL_ID + '-input', cssInputEl.value);
    window.saveToolInput(TOOL_ID + '-mode', currentMode);
  }

  function loadState() {
    if (typeof window.loadToolInput !== 'function') return false;
    
    const savedInput = window.loadToolInput(TOOL_ID + '-input');
    const savedMode = window.loadToolInput(TOOL_ID + '-mode');

    if (savedInput && cssInputEl) {
      cssInputEl.value = savedInput;
    }

    if (savedMode && (savedMode === 'minify' || savedMode === 'beautify')) {
      currentMode = savedMode;
    }
    
    return savedInput !== null;
  }

  // --- Initialization ---
  function init() {
    loadState();
    updateMode(currentMode); // Syncs UI buttons and processes
  }

  init();

})();