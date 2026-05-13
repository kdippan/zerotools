/**
 * ZeroTools - JSON to CSV Converter
 * File: js/tools/json-to-csv.js
 */

(function () {
  const TOOL_ID = 'json-to-csv';

  // --- DOM Elements ---
  const jsonInputEl = document.getElementById('json-input');
  const csvOutputEl = document.getElementById('csv-output');
  
  const delimiterSelectEl = document.getElementById('delimiter');
  const optHeaderEl = document.getElementById('opt-header');
  const optQuoteEl = document.getElementById('opt-quote');
  const optNullEmptyEl = document.getElementById('opt-nullempty');
  
  const tablePreviewEl = document.getElementById('table-preview');
  const statusEl = document.getElementById('status');

  // Actions
  const btnClear = document.getElementById('btn-clear');
  const btnPaste = document.getElementById('btn-paste');
  const btnSample = document.getElementById('btn-sample');
  const btnCopy = document.getElementById('btn-copy');
  const btnDownload = document.getElementById('btn-download');

  // --- Constants & Defaults ---
  const SAMPLE_DATA = [
    {
      "id": 101,
      "name": "Alice Smith",
      "email": "alice@example.com",
      "role": "Admin",
      "tags": ["design", "engineering"],
      "isActive": true,
      "createdAt": "2026-01-15T08:30:00Z"
    },
    {
      "id": 102,
      "name": "Bob \"Bobby\" Tables",
      "email": "bob@example.com",
      "role": "User",
      "tags": ["sales"],
      "isActive": true,
      "createdAt": "2026-02-20T11:15:00Z"
    },
    {
      "id": 103,
      "name": "Charlie Davis",
      "email": null,
      "role": "Guest",
      "tags": [],
      "isActive": false,
      "createdAt": "2026-03-05T09:45:00Z"
    },
    {
      "id": 104,
      "name": "Diana Prince",
      "email": "diana@example.com",
      "role": "Moderator",
      "metadata": { "region": "US-East", "logins": 42 },
      "isActive": true,
      "createdAt": "2026-04-10T14:20:00Z"
    },
    {
      "id": 105,
      "name": "Evan Wright, Jr.",
      "email": "evan.w@example.com",
      "role": "User",
      "tags": ["marketing"],
      "isActive": false,
      "createdAt": "2026-05-12T16:00:00Z"
    }
  ];

  // --- Utility Functions ---

  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag]));
  }

  // --- Core Processing Logic ---

  function processValue(val, options) {
    if (val === null || val === undefined) {
      return options.nullEmpty ? "" : "null";
    }
    if (Array.isArray(val)) {
      return val.join('|');
    }
    if (typeof val === 'object') {
      return JSON.stringify(val);
    }
    return String(val);
  }

  function escapeCSV(str, delimiter, forceQuote) {
    const needsQuotes = forceQuote || 
                        str.includes(delimiter) || 
                        str.includes('\n') || 
                        str.includes('\r') || 
                        str.includes('"');
    
    if (needsQuotes) {
      // Escape internal double quotes by doubling them
      return '"' + str.replace(/"/g, '""') + '"';
    }
    return str;
  }

  function jsonToCSV(jsonArray, options) {
    if (!Array.isArray(jsonArray)) {
      throw new Error("Input must be a JSON array of objects.");
    }
    if (jsonArray.length === 0) {
      throw new Error("JSON array is empty. Nothing to convert.");
    }

    // 1. Collect all unique top-level keys to handle sparse objects
    const keys = new Set();
    jsonArray.forEach(obj => {
      if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
        Object.keys(obj).forEach(k => keys.add(k));
      } else if (typeof obj !== 'object') {
        throw new Error("Array contains non-object values.");
      }
    });

    const columns = Array.from(keys);
    if (columns.length === 0) {
      throw new Error("No properties found in JSON objects.");
    }

    let csvLines = [];
    const delimChar = options.delimiter === 'tab' ? '\t' : options.delimiter;
    
    // 2. Generate Header Row
    if (options.header) {
      const headerLine = columns.map(col => escapeCSV(col, delimChar, options.quoteAll)).join(delimChar);
      csvLines.push(headerLine);
    }

    // 3. Generate Data Rows
    jsonArray.forEach(obj => {
      const row = columns.map(col => {
        const rawVal = obj[col];
        const strVal = processValue(rawVal, options);
        return escapeCSV(strVal, delimChar, options.quoteAll);
      });
      csvLines.push(row.join(delimChar));
    });

    return {
      csvText: csvLines.join('\n'),
      columns: columns,
      rowsCount: jsonArray.length,
      data: jsonArray
    };
  }

  function renderTablePreview(columns, data, options) {
    if (!tablePreviewEl) return;
    
    // Limit preview to first 10 rows for performance and UI constraints
    const previewLimit = 10;
    const previewData = data.slice(0, previewLimit);
    
    let html = '<table style="width: 100%; border-collapse: collapse; font-family: var(--font-mono); font-size: var(--text-sm); text-align: left;">';
    
    if (options.header) {
      html += '<thead style="position: sticky; top: 0; background: var(--bg-elevated); z-index: 1;"><tr>';
      columns.forEach(col => {
        html += `<th style="padding: 10px 12px; color: var(--text-secondary); border-bottom: 1px solid var(--border-strong); white-space: nowrap;">${escapeHTML(col)}</th>`;
      });
      html += '</tr></thead>';
    }
    
    html += '<tbody>';
    previewData.forEach((obj, index) => {
      const bg = index % 2 === 0 ? 'transparent' : 'var(--bg-tertiary)';
      html += `<tr style="background: ${bg};">`;
      columns.forEach(col => {
        const rawVal = obj[col];
        const strVal = processValue(rawVal, options);
        html += `<td style="padding: 8px 12px; border-bottom: 1px solid var(--border-subtle); max-width: 250px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${escapeHTML(strVal)}">${escapeHTML(strVal)}</td>`;
      });
      html += '</tr>';
    });
    html += '</tbody></table>';
    
    if (data.length > previewLimit) {
      html += `<div style="padding: 12px; text-align: center; color: var(--text-tertiary); font-family: var(--font-sans); font-size: var(--text-xs); border-top: 1px solid var(--border-default); background: var(--bg-secondary);">Showing first ${previewLimit} of ${data.length} rows</div>`;
    }
    
    tablePreviewEl.innerHTML = html;
  }

  function processConversion() {
    if (!jsonInputEl || !csvOutputEl) return;
    
    const rawInput = jsonInputEl.value.trim();
    
    if (!rawInput) {
      csvOutputEl.value = '';
      if (tablePreviewEl) tablePreviewEl.innerHTML = '';
      if (statusEl) statusEl.innerHTML = '';
      saveState();
      return;
    }

    try {
      const parsedJSON = JSON.parse(rawInput);
      
      const options = {
        delimiter: delimiterSelectEl ? delimiterSelectEl.value : ',',
        header: optHeaderEl ? optHeaderEl.checked : true,
        quoteAll: optQuoteEl ? optQuoteEl.checked : false,
        nullEmpty: optNullEmptyEl ? optNullEmptyEl.checked : true
      };

      const result = jsonToCSV(parsedJSON, options);
      
      csvOutputEl.value = result.csvText;
      
      if (tablePreviewEl) {
        renderTablePreview(result.columns, result.data, options);
      }

      if (statusEl) {
        statusEl.innerHTML = `<span style="color: var(--color-success);">✓ Success</span> <span style="color: var(--border-strong);">·</span> ${result.rowsCount} rows <span style="color: var(--border-strong);">·</span> ${result.columns.length} columns`;
      }
      
      if (typeof window.trackToolUse === 'function') window.trackToolUse(TOOL_ID);

    } catch (e) {
      csvOutputEl.value = `Error: ${e.message}`;
      if (tablePreviewEl) {
        tablePreviewEl.innerHTML = `<div style="padding: 32px; text-align: center; color: var(--color-error); font-family: var(--font-sans);"><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="margin-bottom: 12px;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg><br>Failed to parse input.<br><span style="font-family: var(--font-mono); font-size: var(--text-sm); margin-top: 8px; display: inline-block;">${escapeHTML(e.message)}</span></div>`;
      }
      if (statusEl) {
        statusEl.innerHTML = `<span style="color: var(--color-error);">✗ Invalid JSON</span>`;
      }
    }

    saveState();
  }

  // --- Event Listeners ---

  const debouncedProcess = debounce(processConversion, 300);

  if (jsonInputEl) {
    jsonInputEl.addEventListener('input', debouncedProcess);
  }

  // Bind Options
  [delimiterSelectEl, optHeaderEl, optQuoteEl, optNullEmptyEl].forEach(el => {
    if (el) el.addEventListener('change', processConversion);
  });

  if (btnClear) {
    btnClear.addEventListener('click', () => {
      if (jsonInputEl) {
        jsonInputEl.value = '';
        jsonInputEl.focus();
      }
      processConversion();
      if (typeof window.saveToolInput === 'function') {
        window.saveToolInput(TOOL_ID, '');
      }
    });
  }

  if (btnPaste) {
    btnPaste.addEventListener('click', async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (jsonInputEl) {
          jsonInputEl.value = text;
          processConversion();
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
      if (jsonInputEl) {
        jsonInputEl.value = JSON.stringify(SAMPLE_DATA, null, 2);
        processConversion();
      }
    });
  }

  if (btnCopy && csvOutputEl) {
    btnCopy.addEventListener('click', () => {
      const output = csvOutputEl.value;
      if (!output || output.startsWith('Error:')) return;
      
      if (typeof window.copyToClipboard === 'function') {
        window.copyToClipboard(output, btnCopy);
      } else {
        navigator.clipboard.writeText(output);
      }
      if (typeof window.trackCopy === 'function') window.trackCopy(TOOL_ID);
    });
  }

  if (btnDownload && csvOutputEl) {
    btnDownload.addEventListener('click', () => {
      const output = csvOutputEl.value;
      if (!output || output.startsWith('Error:')) return;
      
      const filename = `data-${Date.now()}.csv`;
      const blob = new Blob([output], { type: 'text/csv;charset=utf-8;' });
      
      // IE11 & Edge support
      if (navigator.msSaveBlob) { 
        navigator.msSaveBlob(blob, filename);
      } else {
        const link = document.createElement("a");
        if (link.download !== undefined) { 
          const url = URL.createObjectURL(blob);
          link.setAttribute("href", url);
          link.setAttribute("download", filename);
          link.style.visibility = 'hidden';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      }
    });
  }

  // --- State Management ---
  function saveState() {
    if (typeof window.saveToolInput !== 'function') return;
    
    if (jsonInputEl) {
      window.saveToolInput(TOOL_ID + '-input', jsonInputEl.value);
    }
    
    const opts = {
      delimiter: delimiterSelectEl ? delimiterSelectEl.value : ',',
      header: optHeaderEl ? optHeaderEl.checked : true,
      quoteAll: optQuoteEl ? optQuoteEl.checked : false,
      nullEmpty: optNullEmptyEl ? optNullEmptyEl.checked : true
    };
    window.saveToolInput(TOOL_ID + '-options', JSON.stringify(opts));
  }

  function loadState() {
    if (typeof window.loadToolInput !== 'function') return false;
    
    const savedInput = window.loadToolInput(TOOL_ID + '-input');
    const savedOptions = window.loadToolInput(TOOL_ID + '-options');

    if (savedInput && jsonInputEl) {
      jsonInputEl.value = savedInput;
    }

    if (savedOptions) {
      try {
        const opts = JSON.parse(savedOptions);
        if (delimiterSelectEl) delimiterSelectEl.value = opts.delimiter;
        if (optHeaderEl) optHeaderEl.checked = opts.header;
        if (optQuoteEl) optQuoteEl.checked = opts.quoteAll;
        if (optNullEmptyEl) optNullEmptyEl.checked = opts.nullEmpty;
      } catch (e) {
        // silent fail
      }
    }
    
    return savedInput !== null;
  }

  // --- Initialization ---
  function init() {
    loadState();
    processConversion();
  }

  init();

})();