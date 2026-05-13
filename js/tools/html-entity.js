/**
 * ZeroTools - HTML Entity Encoder / Decoder
 * File: js/tools/html-entity.js
 */

(function () {
  const TOOL_ID = 'html-entity';

  // --- DOM Elements ---
  const textInputEl = document.getElementById('text-input');
  const textOutputEl = document.getElementById('text-output');
  
  const modeEncodeEl = document.getElementById('mode-encode');
  const modeDecodeEl = document.getElementById('mode-decode');
  
  const optNamedEl = document.getElementById('opt-named');
  const optDecimalEl = document.getElementById('opt-decimal');
  const optHexEl = document.getElementById('opt-hex');
  
  const encodeOptionsContainer = document.getElementById('encode-options');

  const btnClear = document.getElementById('btn-clear');
  const btnPaste = document.getElementById('btn-paste');
  const btnSample = document.getElementById('btn-sample');
  const btnCopy = document.getElementById('btn-copy');
  
  const searchEntitiesEl = document.getElementById('search-entities');
  const entityTableBodyEl = document.getElementById('entity-table-body');
  
  const statusEl = document.getElementById('status');

  // --- Data & Constants ---
  let currentMode = 'encode'; // 'encode' or 'decode'

  const SAMPLE_TEXT = `<h1>Welcome to ZeroTools!</h1>
<p>This tool safely encodes & decodes HTML entities.</p>
<script>alert("XSS Attempt \u00A9 2026");<\/script>
Mathematical symbols like \u2211, \u221E, and \u222B are also supported.
Enjoy creating safe text blobs! \uD83D\uDE00`;

  // Extended entity map for robust encoding
  const ENTITY_MAP = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
    '/': '&#x2F;',
    '`': '&#x60;',
    '=': '&#x3D;'
  };
  
  // Reference table data
  const REFERENCE_ENTITIES = [
    { char: '<', name: '&lt;', dec: '&#60;', hex: '&#x3C;', desc: 'Less than' },
    { char: '>', name: '&gt;', dec: '&#62;', hex: '&#x3E;', desc: 'Greater than' },
    { char: '&', name: '&amp;', dec: '&#38;', hex: '&#x26;', desc: 'Ampersand' },
    { char: '"', name: '&quot;', dec: '&#34;', hex: '&#x22;', desc: 'Double quote' },
    { char: "'", name: '&apos;', dec: '&#39;', hex: '&#x27;', desc: 'Single quote' },
    { char: ' ', name: '&nbsp;', dec: '&#160;', hex: '&#xA0;', desc: 'Non-breaking space' },
    { char: '©', name: '&copy;', dec: '&#169;', hex: '&#xA9;', desc: 'Copyright' },
    { char: '®', name: '&reg;', dec: '&#174;', hex: '&#xAE;', desc: 'Registered trademark' },
    { char: '™', name: '&trade;', dec: '&#8482;', hex: '&#x2122;', desc: 'Trademark' },
    { char: '€', name: '&euro;', dec: '&#8364;', hex: '&#x20AC;', desc: 'Euro' },
    { char: '£', name: '&pound;', dec: '&#163;', hex: '&#xA3;', desc: 'Pound' },
    { char: '¥', name: '&yen;', dec: '&#165;', hex: '&#xA5;', desc: 'Yen' },
    { char: '¢', name: '&cent;', dec: '&#162;', hex: '&#xA2;', desc: 'Cent' },
    { char: '§', name: '&sect;', dec: '&#167;', hex: '&#xA7;', desc: 'Section' },
    { char: '°', name: '&deg;', dec: '&#176;', hex: '&#xB0;', desc: 'Degree' },
    { char: '±', name: '&plusmn;', dec: '&#177;', hex: '&#xB1;', desc: 'Plus-minus' },
    { char: '×', name: '&times;', dec: '&#215;', hex: '&#xD7;', desc: 'Multiplication' },
    { char: '÷', name: '&divide;', dec: '&#247;', hex: '&#xF7;', desc: 'Division' },
    { char: '¼', name: '&frac14;', dec: '&#188;', hex: '&#xBC;', desc: 'Quarter' },
    { char: '½', name: '&frac12;', dec: '&#189;', hex: '&#xBD;', desc: 'Half' },
    { char: '¾', name: '&frac34;', dec: '&#190;', hex: '&#xBE;', desc: 'Three quarters' },
    { char: 'µ', name: '&micro;', dec: '&#181;', hex: '&#xB5;', desc: 'Micro' },
    { char: '¶', name: '&para;', dec: '&#182;', hex: '&#xB6;', desc: 'Paragraph' },
    { char: '•', name: '&bull;', dec: '&#8226;', hex: '&#x2022;', desc: 'Bullet' },
    { char: '…', name: '&hellip;', dec: '&#8230;', hex: '&#x2026;', desc: 'Horizontal ellipsis' },
    { char: '—', name: '&mdash;', dec: '&#8212;', hex: '&#x2014;', desc: 'Em dash' },
    { char: '–', name: '&ndash;', dec: '&#8211;', hex: '&#x2013;', desc: 'En dash' },
    { char: '“', name: '&ldquo;', dec: '&#8220;', hex: '&#x201C;', desc: 'Left double quote' },
    { char: '”', name: '&rdquo;', dec: '&#8221;', hex: '&#x201D;', desc: 'Right double quote' },
    { char: '‘', name: '&lsquo;', dec: '&#8216;', hex: '&#x2018;', desc: 'Left single quote' },
    { char: '’', name: '&rsquo;', dec: '&#8217;', hex: '&#x2019;', desc: 'Right single quote' },
    { char: '«', name: '&laquo;', dec: '&#171;', hex: '&#xAB;', desc: 'Left angle quote' },
    { char: '»', name: '&raquo;', dec: '&#187;', hex: '&#xBB;', desc: 'Right angle quote' },
    { char: '‹', name: '&lsaquo;', dec: '&#8249;', hex: '&#x2039;', desc: 'Single left angle quote' },
    { char: '›', name: '&rsaquo;', dec: '&#8250;', hex: '&#x203A;', desc: 'Single right angle quote' },
    { char: '←', name: '&larr;', dec: '&#8592;', hex: '&#x2190;', desc: 'Left arrow' },
    { char: '↑', name: '&uarr;', dec: '&#8593;', hex: '&#x2191;', desc: 'Up arrow' },
    { char: '→', name: '&rarr;', dec: '&#8594;', hex: '&#x2192;', desc: 'Right arrow' },
    { char: '↓', name: '&darr;', dec: '&#8595;', hex: '&#x2193;', desc: 'Down arrow' },
    { char: '↔', name: '&harr;', dec: '&#8596;', hex: '&#x2194;', desc: 'Left right arrow' },
    { char: '↵', name: '&crarr;', dec: '&#8629;', hex: '&#x21B5;', desc: 'Carriage return' },
    { char: '∀', name: '&forall;', dec: '&#8704;', hex: '&#x2200;', desc: 'For all' },
    { char: '∂', name: '&part;', dec: '&#8706;', hex: '&#x2202;', desc: 'Partial differential' },
    { char: '∃', name: '&exist;', dec: '&#8707;', hex: '&#x2203;', desc: 'There exists' },
    { char: '∅', name: '&empty;', dec: '&#8709;', hex: '&#x2205;', desc: 'Empty set' },
    { char: '∇', name: '&nabla;', dec: '&#8711;', hex: '&#x2207;', desc: 'Nabla' },
    { char: '∈', name: '&isin;', dec: '&#8712;', hex: '&#x2208;', desc: 'Element of' },
    { char: '∉', name: '&notin;', dec: '&#8713;', hex: '&#x2209;', desc: 'Not element of' },
    { char: '∏', name: '&prod;', dec: '&#8719;', hex: '&#x220F;', desc: 'Product' },
    { char: '∑', name: '&sum;', dec: '&#8721;', hex: '&#x2211;', desc: 'Sum' },
    { char: '−', name: '&minus;', dec: '&#8722;', hex: '&#x2212;', desc: 'Minus' },
    { char: '∗', name: '&lowast;', dec: '&#8727;', hex: '&#x2217;', desc: 'Asterisk operator' },
    { char: '√', name: '&radic;', dec: '&#8730;', hex: '&#x221A;', desc: 'Square root' },
    { char: '∝', name: '&prop;', dec: '&#8733;', hex: '&#x221D;', desc: 'Proportional to' },
    { char: '∞', name: '&infin;', dec: '&#8734;', hex: '&#x221E;', desc: 'Infinity' },
    { char: '∠', name: '&ang;', dec: '&#8736;', hex: '&#x2220;', desc: 'Angle' },
    { char: '∧', name: '&and;', dec: '&#8743;', hex: '&#x2227;', desc: 'Logical and' },
    { char: '∨', name: '&or;', dec: '&#8744;', hex: '&#x2228;', desc: 'Logical or' },
    { char: '∩', name: '&cap;', dec: '&#8745;', hex: '&#x2229;', desc: 'Intersection' },
    { char: '∪', name: '&cup;', dec: '&#8746;', hex: '&#x222A;', desc: 'Union' },
    { char: '∫', name: '&int;', dec: '&#8747;', hex: '&#x222B;', desc: 'Integral' },
    { char: '∴', name: '&there4;', dec: '&#8756;', hex: '&#x2234;', desc: 'Therefore' },
    { char: '∼', name: '&sim;', dec: '&#8764;', hex: '&#x223C;', desc: 'Tilde operator' },
    { char: '≅', name: '&cong;', dec: '&#8773;', hex: '&#x2245;', desc: 'Approximately equal' },
    { char: '≈', name: '&asymp;', dec: '&#8776;', hex: '&#x2248;', desc: 'Almost equal to' },
    { char: '≠', name: '&ne;', dec: '&#8800;', hex: '&#x2260;', desc: 'Not equal' },
    { char: '≡', name: '&equiv;', dec: '&#8801;', hex: '&#x2261;', desc: 'Identical to' },
    { char: '≤', name: '&le;', dec: '&#8804;', hex: '&#x2264;', desc: 'Less-than or equal' },
    { char: '≥', name: '&ge;', dec: '&#8805;', hex: '&#x2265;', desc: 'Greater-than or equal' },
    { char: '⊂', name: '&sub;', dec: '&#8834;', hex: '&#x2282;', desc: 'Subset of' },
    { char: '⊃', name: '&sup;', dec: '&#8835;', hex: '&#x2283;', desc: 'Superset of' },
    { char: '⊄', name: '&nsub;', dec: '&#8836;', hex: '&#x2284;', desc: 'Not a subset of' },
    { char: '⊆', name: '&sube;', dec: '&#8838;', hex: '&#x2286;', desc: 'Subset or equal' },
    { char: '⊇', name: '&supe;', dec: '&#8839;', hex: '&#x2287;', desc: 'Superset or equal' },
    { char: '⊕', name: '&oplus;', dec: '&#8853;', hex: '&#x2295;', desc: 'Circled plus' },
    { char: '⊗', name: '&otimes;', dec: '&#8855;', hex: '&#x2297;', desc: 'Circled times' },
    { char: '⊥', name: '&perp;', dec: '&#8869;', hex: '&#x22A5;', desc: 'Up tack' },
    { char: '⋅', name: '&sdot;', dec: '&#8901;', hex: '&#x22C5;', desc: 'Dot operator' }
  ];

  // Helper map for fast decode lookups
  const NAMED_TO_CHAR = {};
  REFERENCE_ENTITIES.forEach(entity => {
    NAMED_TO_CHAR[entity.name] = entity.char;
  });
  // Add common required ones not in the visual table
  NAMED_TO_CHAR['&apos;'] = "'";

  // --- Core Processing Logic ---

  function encodeHtml(text) {
    if (!text) return '';
    
    const useNamed = optNamedEl && optNamedEl.checked;
    const useDecimal = optDecimalEl && optDecimalEl.checked;
    const useHex = optHexEl && optHexEl.checked;

    // Use a regex that matches standard HTML special chars OR any non-ASCII character
    return text.replace(/[&<>"'/`=]|[\x80-\uFFFF]/g, function (char) {
      
      // If it's a standard special char and we want named entities
      if (useNamed && ENTITY_MAP[char]) {
        // Only return named if it's the specific named option, else we'll process below
        if (char !== '/' && char !== '`' && char !== '=') return ENTITY_MAP[char]; 
      }

      // If we prefer named and it's in our reference table
      if (useNamed) {
         const ref = REFERENCE_ENTITIES.find(r => r.char === char);
         if (ref) return ref.name;
      }

      const codePoint = char.codePointAt(0);

      if (useHex) {
        return '&#x' + codePoint.toString(16).toUpperCase() + ';';
      } else if (useDecimal) {
        return '&#' + codePoint + ';';
      }

      // Fallback: If neither Decimal nor Hex is checked, default to named for basic ones, and raw for others
      if (ENTITY_MAP[char]) return ENTITY_MAP[char];
      return char; 
    });
  }

  function decodeHtml(html) {
    if (!html) return '';
    
    return html.replace(/&#x([0-9a-fA-F]+);|&#(\d+);|&([a-zA-Z0-9]+);/g, function(match, hex, dec, name) {
      if (hex) {
        return String.fromCodePoint(parseInt(hex, 16));
      } else if (dec) {
        return String.fromCodePoint(parseInt(dec, 10));
      } else if (name) {
        const fullEntity = '&' + name + ';';
        return NAMED_TO_CHAR[fullEntity] || match; // Return original if unknown
      }
      return match;
    });
  }

  function processText() {
    if (!textInputEl || !textOutputEl) return;
    
    const input = textInputEl.value;
    
    if (!input) {
      textOutputEl.innerHTML = '';
      if (statusEl) statusEl.innerHTML = '';
      saveState();
      return;
    }

    let output = '';
    
    try {
      if (currentMode === 'encode') {
        output = encodeHtml(input);
      } else {
        output = decodeHtml(input);
      }
      
      // Escape output for display in the panel (since it's a div, we don't want to actually render the HTML tags if decoding)
      // Actually, if we are in a text-based output, we want to show the literal string.
      // We are using a textarea in the generic tool interface, wait, spec says "Output panel".
      // Since it's <div class="output-panel" id="text-output"> we MUST escape it to show literal text.
      textOutputEl.textContent = output;

      if (statusEl) {
        const chars = output.length;
        statusEl.innerHTML = `<span style="color: var(--color-success);">✓ ${currentMode === 'encode' ? 'Encoded' : 'Decoded'}</span> <span style="color: var(--border-strong);">·</span> ${chars} characters`;
      }
    } catch (e) {
      textOutputEl.innerHTML = `<span style="color: var(--color-error);">Error processing text: ${e.message}</span>`;
      if (statusEl) statusEl.innerHTML = '';
    }

    saveState();
  }

  function updateMode(mode) {
    currentMode = mode;
    
    if (modeEncodeEl && modeDecodeEl) {
      if (mode === 'encode') {
        modeEncodeEl.classList.add('active');
        modeEncodeEl.classList.remove('btn-ghost');
        modeEncodeEl.classList.add('btn-secondary');
        
        modeDecodeEl.classList.remove('active');
        modeDecodeEl.classList.add('btn-ghost');
        modeDecodeEl.classList.remove('btn-secondary');
        
        if (encodeOptionsContainer) encodeOptionsContainer.style.opacity = '1';
        if (encodeOptionsContainer) encodeOptionsContainer.style.pointerEvents = 'auto';
        
      } else {
        modeDecodeEl.classList.add('active');
        modeDecodeEl.classList.remove('btn-ghost');
        modeDecodeEl.classList.add('btn-secondary');
        
        modeEncodeEl.classList.remove('active');
        modeEncodeEl.classList.add('btn-ghost');
        modeEncodeEl.classList.remove('btn-secondary');
        
        if (encodeOptionsContainer) encodeOptionsContainer.style.opacity = '0.4';
        if (encodeOptionsContainer) encodeOptionsContainer.style.pointerEvents = 'none';
      }
    }
    
    processText();
  }

  function renderReferenceTable(query = '') {
    if (!entityTableBodyEl) return;
    
    let html = '';
    const term = query.toLowerCase().trim();

    REFERENCE_ENTITIES.forEach(entity => {
      // Filter logic
      if (term) {
        if (!entity.char.toLowerCase().includes(term) && 
            !entity.name.toLowerCase().includes(term) && 
            !entity.dec.toLowerCase().includes(term) && 
            !entity.hex.toLowerCase().includes(term) && 
            !entity.desc.toLowerCase().includes(term)) {
          return;
        }
      }

      html += `
        <tr style="border-bottom: 1px solid var(--border-subtle);">
          <td style="padding: 8px 12px; color: var(--text-primary); font-family: var(--font-sans); font-size: 18px; text-align: center; width: 60px;">${entity.char}</td>
          <td style="padding: 8px 12px; font-family: var(--font-mono); color: var(--syntax-string); cursor: pointer;" title="Click to copy" onclick="navigator.clipboard.writeText('${entity.name}')">${escapeHtml(entity.name)}</td>
          <td style="padding: 8px 12px; font-family: var(--font-mono); color: var(--syntax-number); cursor: pointer;" title="Click to copy" onclick="navigator.clipboard.writeText('${entity.dec}')">${escapeHtml(entity.dec)}</td>
          <td style="padding: 8px 12px; font-family: var(--font-mono); color: var(--syntax-key); cursor: pointer;" title="Click to copy" onclick="navigator.clipboard.writeText('${entity.hex}')">${escapeHtml(entity.hex)}</td>
          <td style="padding: 8px 12px; color: var(--text-secondary); font-family: var(--font-sans); font-size: var(--text-sm);">${entity.desc}</td>
        </tr>
      `;
    });

    if (html === '') {
      html = `<tr><td colspan="5" style="padding: 16px; text-align: center; color: var(--text-tertiary);">No entities match "${escapeHtml(term)}"</td></tr>`;
    }

    entityTableBodyEl.innerHTML = html;
  }

  // --- Event Listeners ---

  if (textInputEl) {
    textInputEl.addEventListener('input', processText);
  }

  if (modeEncodeEl) modeEncodeEl.addEventListener('click', () => updateMode('encode'));
  if (modeDecodeEl) modeDecodeEl.addEventListener('click', () => updateMode('decode'));

  [optNamedEl, optDecimalEl, optHexEl].forEach(el => {
    if (el) el.addEventListener('change', () => {
      // Ensure logic of radio buttons if needed, but spec asks for checkboxes.
      // If we treat them as radio logically for the fallback non-named chars:
      if (el.id === 'opt-decimal' && el.checked) { if (optHexEl) optHexEl.checked = false; }
      if (el.id === 'opt-hex' && el.checked) { if (optDecimalEl) optDecimalEl.checked = false; }
      processText();
    });
  });

  if (btnClear) {
    btnClear.addEventListener('click', () => {
      if (textInputEl) {
        textInputEl.value = '';
        textInputEl.focus();
      }
      processText();
      
      if (typeof window.saveToolInput === 'function') {
        window.saveToolInput(TOOL_ID, '');
      }
    });
  }

  if (btnPaste) {
    btnPaste.addEventListener('click', async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (textInputEl) {
          textInputEl.value = text;
          processText();
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
      if (textInputEl) {
        textInputEl.value = SAMPLE_TEXT;
        updateMode('encode'); // Force encode for sample
      }
    });
  }

  if (btnCopy && textOutputEl) {
    btnCopy.addEventListener('click', () => {
      const output = textOutputEl.textContent;
      if (!output) return;
      
      if (typeof window.copyToClipboard === 'function') {
        window.copyToClipboard(output, btnCopy);
      } else {
        navigator.clipboard.writeText(output);
      }
      
      if (typeof window.trackCopy === 'function') window.trackCopy(TOOL_ID);
    });
  }

  if (searchEntitiesEl) {
    searchEntitiesEl.addEventListener('input', (e) => {
      renderReferenceTable(e.target.value);
    });
  }

  // --- State Management ---
  function saveState() {
    if (typeof window.saveToolInput !== 'function') return;
    
    if (textInputEl) window.saveToolInput(TOOL_ID + '-input', textInputEl.value);
    
    const opts = {
      mode: currentMode,
      named: optNamedEl ? optNamedEl.checked : true,
      decimal: optDecimalEl ? optDecimalEl.checked : false,
      hex: optHexEl ? optHexEl.checked : false
    };
    window.saveToolInput(TOOL_ID + '-options', JSON.stringify(opts));
  }

  function loadState() {
    if (typeof window.loadToolInput !== 'function') return false;
    
    const savedInput = window.loadToolInput(TOOL_ID + '-input');
    const savedOptions = window.loadToolInput(TOOL_ID + '-options');

    if (savedInput && textInputEl) {
      textInputEl.value = savedInput;
    }

    if (savedOptions) {
      try {
        const opts = JSON.parse(savedOptions);
        currentMode = opts.mode || 'encode';
        if (optNamedEl) optNamedEl.checked = opts.named;
        if (optDecimalEl) optDecimalEl.checked = opts.decimal;
        if (optHexEl) optHexEl.checked = opts.hex;
      } catch (e) {
        // silent fail
      }
    }
    
    return savedInput !== null;
  }

  // --- Initialization ---
  function init() {
    renderReferenceTable();
    loadState();
    updateMode(currentMode); // Syncs UI buttons and processes
  }

  init();

})();