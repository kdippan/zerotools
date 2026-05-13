/**
 * ZeroTools - Image to Base64 Converter
 * File: js/tools/image-base64.js
 */

(function () {
  const TOOL_ID = 'image-base64';

  // --- DOM Elements ---
  const dropZoneEl = document.getElementById('drop-zone');
  const fileInputEl = document.getElementById('file-input');
  const imgPreviewContainerEl = document.getElementById('img-preview-container');
  const imgPreviewEl = document.getElementById('img-preview');
  
  const fileNameEl = document.getElementById('file-name');
  const fileTypeBadgeEl = document.getElementById('file-type-badge');
  const fileSizeOrigEl = document.getElementById('file-size-orig');
  const fileSizeB64El = document.getElementById('file-size-b64');
  const fileOverheadEl = document.getElementById('file-overhead');

  const tabBtns = document.querySelectorAll('.tab-btn');
  const outputPanels = document.querySelectorAll('.tab-panel');

  const outRawEl = document.getElementById('out-raw');
  const outUriEl = document.getElementById('out-uri');
  const outCssEl = document.getElementById('out-css');
  const outHtmlEl = document.getElementById('out-html');

  const btnCopyRaw = document.getElementById('btn-copy-raw');
  const btnCopyUri = document.getElementById('btn-copy-uri');
  const btnCopyCss = document.getElementById('btn-copy-css');
  const btnCopyHtml = document.getElementById('btn-copy-html');

  const btnClear = document.getElementById('btn-clear');
  const statusEl = document.getElementById('status');

  // --- Utility Functions ---

  function formatBytes(bytes, decimals = 2) {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  }

  function getFileExtension(filename) {
    return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2).toUpperCase() || 'UNKNOWN';
  }

  function switchTab(targetId) {
    tabBtns.forEach(btn => {
      if (btn.dataset.target === targetId) {
        btn.classList.add('active');
        btn.style.color = 'var(--accent)';
        btn.style.borderBottomColor = 'var(--accent)';
      } else {
        btn.classList.remove('active');
        btn.style.color = 'var(--text-secondary)';
        btn.style.borderBottomColor = 'transparent';
      }
    });

    outputPanels.forEach(panel => {
      if (panel.id === targetId) {
        panel.style.display = 'block';
      } else {
        panel.style.display = 'none';
      }
    });
  }

  // --- Core Processing Logic ---

  function handleFile(file) {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      if (typeof window.showToast === 'function') {
        window.showToast('Please select a valid image file.', 'error');
      }
      if (statusEl) {
        statusEl.innerHTML = `<span style="color: var(--color-error);">✗ Error: Selected file is not an image.</span>`;
      }
      return;
    }

    // Recommended soft limit (e.g., 5MB) to prevent browser locking, but we don't strictly block it
    if (file.size > 10 * 1024 * 1024) {
      if (typeof window.showToast === 'function') {
        window.showToast('Warning: Large images may slow down your browser.', 'warning');
      }
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const dataUri = e.target.result;
      const rawB64 = dataUri.split(',')[1];
      const mimeType = file.type;

      // Update Preview
      if (imgPreviewEl) imgPreviewEl.src = dataUri;
      if (imgPreviewContainerEl) imgPreviewContainerEl.style.display = 'flex';
      
      // Update File Info
      const origSize = file.size;
      const b64Size = Math.round((rawB64.length * 3) / 4); // Roughly accurate representation of payload size, though string itself takes JS memory
      const actualStringSize = rawB64.length; 
      
      // Base64 expands data by roughly 33%
      const overheadPercent = (((actualStringSize - origSize) / origSize) * 100).toFixed(1);

      if (fileNameEl) fileNameEl.textContent = file.name;
      if (fileTypeBadgeEl) fileTypeBadgeEl.textContent = getFileExtension(file.name);
      if (fileSizeOrigEl) fileSizeOrigEl.textContent = formatBytes(origSize);
      if (fileSizeB64El) fileSizeB64El.textContent = formatBytes(actualStringSize);
      if (fileOverheadEl) {
        fileOverheadEl.textContent = `+${overheadPercent}%`;
        fileOverheadEl.style.color = 'var(--color-warning)';
      }

      // Populate Outputs
      if (outRawEl) outRawEl.value = rawB64;
      if (outUriEl) outUriEl.value = dataUri;
      if (outCssEl) outCssEl.value = `background-image: url("${dataUri}");`;
      if (outHtmlEl) outHtmlEl.value = `<img src="${dataUri}" alt="${escapeHtml(file.name)}" />`;

      if (statusEl) {
        statusEl.innerHTML = `<span style="color: var(--color-success);">✓ Encoded Successfully</span>`;
      }

      if (typeof window.trackToolUse === 'function') window.trackToolUse(TOOL_ID);
    };

    reader.onerror = () => {
      if (statusEl) {
        statusEl.innerHTML = `<span style="color: var(--color-error);">✗ Error reading file.</span>`;
      }
    };

    reader.readAsDataURL(file);
  }

  function escapeHtml(unsafe) {
    return (unsafe || '').toString()
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function clearAll() {
    if (fileInputEl) fileInputEl.value = '';
    
    if (imgPreviewEl) imgPreviewEl.src = '';
    if (imgPreviewContainerEl) imgPreviewContainerEl.style.display = 'none';
    
    if (fileNameEl) fileNameEl.textContent = '-';
    if (fileTypeBadgeEl) fileTypeBadgeEl.textContent = 'IMG';
    if (fileSizeOrigEl) fileSizeOrigEl.textContent = '-';
    if (fileSizeB64El) fileSizeB64El.textContent = '-';
    if (fileOverheadEl) {
      fileOverheadEl.textContent = '-';
      fileOverheadEl.style.color = 'var(--text-tertiary)';
    }

    [outRawEl, outUriEl, outCssEl, outHtmlEl].forEach(el => {
      if (el) el.value = '';
    });

    if (statusEl) statusEl.innerHTML = '';
  }

  // --- Event Listeners ---

  // Drag and Drop
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
        dropZoneEl.style.backgroundColor = 'var(--bg-elevated)';
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropZoneEl.addEventListener(eventName, () => {
        dropZoneEl.style.borderColor = 'var(--border-default)';
        dropZoneEl.style.backgroundColor = 'var(--bg-tertiary)';
      }, false);
    });

    dropZoneEl.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      if (files && files.length > 0) {
        handleFile(files[0]);
      }
    }, false);

    // Click to upload
    dropZoneEl.addEventListener('click', () => {
      if (fileInputEl) fileInputEl.click();
    });
  }

  if (fileInputEl) {
    fileInputEl.addEventListener('change', function() {
      if (this.files && this.files.length > 0) {
        handleFile(this.files[0]);
      }
    });
  }

  // Tabs
  tabBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = e.currentTarget.dataset.target;
      switchTab(target);
    });
  });

  // Copy Buttons
  const copyActions = [
    { btn: btnCopyRaw, input: outRawEl },
    { btn: btnCopyUri, input: outUriEl },
    { btn: btnCopyCss, input: outCssEl },
    { btn: btnCopyHtml, input: outHtmlEl }
  ];

  copyActions.forEach(({ btn, input }) => {
    if (btn && input) {
      btn.addEventListener('click', () => {
        if (!input.value) return;
        if (typeof window.copyToClipboard === 'function') {
          window.copyToClipboard(input.value, btn);
        } else {
          navigator.clipboard.writeText(input.value);
        }
        if (typeof window.trackCopy === 'function') window.trackCopy(TOOL_ID);
      });
    }
  });

  if (btnClear) {
    btnClear.addEventListener('click', clearAll);
  }

  // --- Initialization ---
  function init() {
    // Set initial tab styling
    switchTab('panel-raw');
    
    // We intentionally do not save base64 image strings to localStorage 
    // to prevent quickly exceeding the 5MB browser quota.
  }

  init();

})();/**
 * ZeroTools - Image to Base64 Converter
 * File: js/tools/image-base64.js
 */

(function () {
  const TOOL_ID = 'image-base64';

  // --- DOM Elements ---
  const dropZoneEl = document.getElementById('drop-zone');
  const fileInputEl = document.getElementById('file-input');
  const imgPreviewContainerEl = document.getElementById('img-preview-container');
  const imgPreviewEl = document.getElementById('img-preview');
  
  const fileNameEl = document.getElementById('file-name');
  const fileTypeBadgeEl = document.getElementById('file-type-badge');
  const fileSizeOrigEl = document.getElementById('file-size-orig');
  const fileSizeB64El = document.getElementById('file-size-b64');
  const fileOverheadEl = document.getElementById('file-overhead');

  const tabBtns = document.querySelectorAll('.tab-btn');
  const outputPanels = document.querySelectorAll('.tab-panel');

  const outRawEl = document.getElementById('out-raw');
  const outUriEl = document.getElementById('out-uri');
  const outCssEl = document.getElementById('out-css');
  const outHtmlEl = document.getElementById('out-html');

  const btnCopyRaw = document.getElementById('btn-copy-raw');
  const btnCopyUri = document.getElementById('btn-copy-uri');
  const btnCopyCss = document.getElementById('btn-copy-css');
  const btnCopyHtml = document.getElementById('btn-copy-html');

  const btnClear = document.getElementById('btn-clear');
  const statusEl = document.getElementById('status');

  // --- Utility Functions ---

  function formatBytes(bytes, decimals = 2) {
    if (!+bytes) return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  }

  function getFileExtension(filename) {
    return filename.slice((filename.lastIndexOf(".") - 1 >>> 0) + 2).toUpperCase() || 'UNKNOWN';
  }

  function switchTab(targetId) {
    tabBtns.forEach(btn => {
      if (btn.dataset.target === targetId) {
        btn.classList.add('active');
        btn.style.color = 'var(--accent)';
        btn.style.borderBottomColor = 'var(--accent)';
      } else {
        btn.classList.remove('active');
        btn.style.color = 'var(--text-secondary)';
        btn.style.borderBottomColor = 'transparent';
      }
    });

    outputPanels.forEach(panel => {
      if (panel.id === targetId) {
        panel.style.display = 'block';
      } else {
        panel.style.display = 'none';
      }
    });
  }

  // --- Core Processing Logic ---

  function handleFile(file) {
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      if (typeof window.showToast === 'function') {
        window.showToast('Please select a valid image file.', 'error');
      }
      if (statusEl) {
        statusEl.innerHTML = `<span style="color: var(--color-error);">✗ Error: Selected file is not an image.</span>`;
      }
      return;
    }

    // Recommended soft limit (e.g., 5MB) to prevent browser locking, but we don't strictly block it
    if (file.size > 10 * 1024 * 1024) {
      if (typeof window.showToast === 'function') {
        window.showToast('Warning: Large images may slow down your browser.', 'warning');
      }
    }

    const reader = new FileReader();

    reader.onload = (e) => {
      const dataUri = e.target.result;
      const rawB64 = dataUri.split(',')[1];
      const mimeType = file.type;

      // Update Preview
      if (imgPreviewEl) imgPreviewEl.src = dataUri;
      if (imgPreviewContainerEl) imgPreviewContainerEl.style.display = 'flex';
      
      // Update File Info
      const origSize = file.size;
      const b64Size = Math.round((rawB64.length * 3) / 4); // Roughly accurate representation of payload size, though string itself takes JS memory
      const actualStringSize = rawB64.length; 
      
      // Base64 expands data by roughly 33%
      const overheadPercent = (((actualStringSize - origSize) / origSize) * 100).toFixed(1);

      if (fileNameEl) fileNameEl.textContent = file.name;
      if (fileTypeBadgeEl) fileTypeBadgeEl.textContent = getFileExtension(file.name);
      if (fileSizeOrigEl) fileSizeOrigEl.textContent = formatBytes(origSize);
      if (fileSizeB64El) fileSizeB64El.textContent = formatBytes(actualStringSize);
      if (fileOverheadEl) {
        fileOverheadEl.textContent = `+${overheadPercent}%`;
        fileOverheadEl.style.color = 'var(--color-warning)';
      }

      // Populate Outputs
      if (outRawEl) outRawEl.value = rawB64;
      if (outUriEl) outUriEl.value = dataUri;
      if (outCssEl) outCssEl.value = `background-image: url("${dataUri}");`;
      if (outHtmlEl) outHtmlEl.value = `<img src="${dataUri}" alt="${escapeHtml(file.name)}" />`;

      if (statusEl) {
        statusEl.innerHTML = `<span style="color: var(--color-success);">✓ Encoded Successfully</span>`;
      }

      if (typeof window.trackToolUse === 'function') window.trackToolUse(TOOL_ID);
    };

    reader.onerror = () => {
      if (statusEl) {
        statusEl.innerHTML = `<span style="color: var(--color-error);">✗ Error reading file.</span>`;
      }
    };

    reader.readAsDataURL(file);
  }

  function escapeHtml(unsafe) {
    return (unsafe || '').toString()
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function clearAll() {
    if (fileInputEl) fileInputEl.value = '';
    
    if (imgPreviewEl) imgPreviewEl.src = '';
    if (imgPreviewContainerEl) imgPreviewContainerEl.style.display = 'none';
    
    if (fileNameEl) fileNameEl.textContent = '-';
    if (fileTypeBadgeEl) fileTypeBadgeEl.textContent = 'IMG';
    if (fileSizeOrigEl) fileSizeOrigEl.textContent = '-';
    if (fileSizeB64El) fileSizeB64El.textContent = '-';
    if (fileOverheadEl) {
      fileOverheadEl.textContent = '-';
      fileOverheadEl.style.color = 'var(--text-tertiary)';
    }

    [outRawEl, outUriEl, outCssEl, outHtmlEl].forEach(el => {
      if (el) el.value = '';
    });

    if (statusEl) statusEl.innerHTML = '';
  }

  // --- Event Listeners ---

  // Drag and Drop
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
        dropZoneEl.style.backgroundColor = 'var(--bg-elevated)';
      }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
      dropZoneEl.addEventListener(eventName, () => {
        dropZoneEl.style.borderColor = 'var(--border-default)';
        dropZoneEl.style.backgroundColor = 'var(--bg-tertiary)';
      }, false);
    });

    dropZoneEl.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      if (files && files.length > 0) {
        handleFile(files[0]);
      }
    }, false);

    // Click to upload
    dropZoneEl.addEventListener('click', () => {
      if (fileInputEl) fileInputEl.click();
    });
  }

  if (fileInputEl) {
    fileInputEl.addEventListener('change', function() {
      if (this.files && this.files.length > 0) {
        handleFile(this.files[0]);
      }
    });
  }

  // Tabs
  tabBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const target = e.currentTarget.dataset.target;
      switchTab(target);
    });
  });

  // Copy Buttons
  const copyActions = [
    { btn: btnCopyRaw, input: outRawEl },
    { btn: btnCopyUri, input: outUriEl },
    { btn: btnCopyCss, input: outCssEl },
    { btn: btnCopyHtml, input: outHtmlEl }
  ];

  copyActions.forEach(({ btn, input }) => {
    if (btn && input) {
      btn.addEventListener('click', () => {
        if (!input.value) return;
        if (typeof window.copyToClipboard === 'function') {
          window.copyToClipboard(input.value, btn);
        } else {
          navigator.clipboard.writeText(input.value);
        }
        if (typeof window.trackCopy === 'function') window.trackCopy(TOOL_ID);
      });
    }
  });

  if (btnClear) {
    btnClear.addEventListener('click', clearAll);
  }

  // --- Initialization ---
  function init() {
    // Set initial tab styling
    switchTab('panel-raw');
 
  }

  init();

})();