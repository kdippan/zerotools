/**
 * ZeroTools - Unix Timestamp Converter
 * File: js/tools/timestamp-converter.js
 */

(function () {
  const TOOL_ID = 'timestamp-converter';

  // --- DOM Elements ---
  const liveTimestampEl = document.getElementById('live-timestamp');
  const liveTimestampMsEl = document.getElementById('live-timestamp-ms');
  
  const unixInputEl = document.getElementById('unix-input');
  const btnUnixToDate = document.getElementById('btn-unix-to-date');
  const outputIsoEl = document.getElementById('output-iso');
  const outputRfcEl = document.getElementById('output-rfc');
  const outputLocalEl = document.getElementById('output-local');
  const outputRelativeEl = document.getElementById('output-relative');
  const tzSelectEl = document.getElementById('tz-select');

  const dateInputEl = document.getElementById('date-input');
  const btnDateToUnix = document.getElementById('btn-date-to-unix');
  const outputUnixSecEl = document.getElementById('output-unix-sec');
  const outputUnixMsEl = document.getElementById('output-unix-ms');

  // --- Live Clock ---
  function updateLiveClock() {
    if (!liveTimestampEl || !liveTimestampMsEl) return;
    const now = Date.now();
    liveTimestampEl.textContent = Math.floor(now / 1000);
    liveTimestampMsEl.textContent = now;
  }
  
  setInterval(updateLiveClock, 1000);
  updateLiveClock();

  // --- Utility Functions ---

  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  function getRelativeTime(timestampMs) {
    const now = Date.now();
    const diffMs = timestampMs - now;
    const diffAbs = Math.abs(diffMs);

    const seconds = Math.floor(diffAbs / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);
    const months = Math.floor(days / 30);
    const years = Math.floor(days / 365);

    let val, unit;
    
    if (seconds < 60) { val = seconds; unit = 'second'; }
    else if (minutes < 60) { val = minutes; unit = 'minute'; }
    else if (hours < 24) { val = hours; unit = 'hour'; }
    else if (days < 30) { val = days; unit = 'day'; }
    else if (months < 12) { val = months; unit = 'month'; }
    else { val = years; unit = 'year'; }

    if (val !== 1) unit += 's';

    if (diffMs < 0) {
      return val === 0 ? 'just now' : `${val} ${unit} ago`;
    } else {
      return val === 0 ? 'right now' : `in ${val} ${unit}`;
    }
  }

  function formatTimezone(date, timeZone) {
    try {
      return new Intl.DateTimeFormat('en-US', {
        timeZone: timeZone,
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short'
      }).format(date);
    } catch (e) {
      return date.toLocaleString(); // Fallback if TZ is invalid
    }
  }

  // --- Core Processing Logic ---

  function handleUnixToDate() {
    const val = unixInputEl.value.trim();
    if (!val) {
      clearUnixOutputs();
      return;
    }

    let timestamp = parseInt(val, 10);
    if (isNaN(timestamp)) {
      showUnixError('Invalid number');
      return;
    }

    // Auto-detect seconds vs milliseconds (rough heuristic: year 2001+ in ms is > 1 trillion)
    const isMilliseconds = timestamp > 100000000000;
    const tsMs = isMilliseconds ? timestamp : timestamp * 1000;

    const date = new Date(tsMs);

    if (isNaN(date.getTime())) {
      showUnixError('Invalid Date generated');
      return;
    }

    const tz = tzSelectEl ? tzSelectEl.value : 'UTC';

    outputIsoEl.textContent = date.toISOString();
    outputRfcEl.textContent = date.toUTCString();
    outputLocalEl.textContent = formatTimezone(date, tz);
    outputRelativeEl.textContent = getRelativeTime(tsMs);

    // Style cleanup
    [outputIsoEl, outputRfcEl, outputLocalEl, outputRelativeEl].forEach(el => {
      el.style.color = 'var(--accent)';
    });

    if (typeof window.saveToolInput === 'function') {
      window.saveToolInput(TOOL_ID + '-unix', val);
      window.saveToolInput(TOOL_ID + '-tz', tz);
    }
  }

  function handleDateToUnix() {
    const val = dateInputEl.value;
    if (!val) {
      clearDateOutputs();
      return;
    }

    const date = new Date(val);

    if (isNaN(date.getTime())) {
      showDateError('Invalid Date format');
      return;
    }

    const tsMs = date.getTime();
    const tsSec = Math.floor(tsMs / 1000);

    outputUnixSecEl.textContent = tsSec;
    outputUnixMsEl.textContent = tsMs;

    outputUnixSecEl.style.color = 'var(--accent)';
    outputUnixMsEl.style.color = 'var(--accent)';

    if (typeof window.saveToolInput === 'function') {
      window.saveToolInput(TOOL_ID + '-date', val);
    }
  }

  // --- UI Helpers ---

  function clearUnixOutputs() {
    outputIsoEl.textContent = '-';
    outputRfcEl.textContent = '-';
    outputLocalEl.textContent = '-';
    outputRelativeEl.textContent = '-';
    [outputIsoEl, outputRfcEl, outputLocalEl, outputRelativeEl].forEach(el => {
      el.style.color = 'var(--text-tertiary)';
    });
  }

  function showUnixError(msg) {
    clearUnixOutputs();
    outputIsoEl.textContent = `Error: ${msg}`;
    outputIsoEl.style.color = 'var(--color-error)';
  }

  function clearDateOutputs() {
    outputUnixSecEl.textContent = '-';
    outputUnixMsEl.textContent = '-';
    outputUnixSecEl.style.color = 'var(--text-tertiary)';
    outputUnixMsEl.style.color = 'var(--text-tertiary)';
  }

  function showDateError(msg) {
    clearDateOutputs();
    outputUnixSecEl.textContent = `Error: ${msg}`;
    outputUnixSecEl.style.color = 'var(--color-error)';
  }

  // --- Event Listeners ---

  const debouncedUnixToDate = debounce(handleUnixToDate, 200);
  const debouncedDateToUnix = debounce(handleDateToUnix, 200);

  if (unixInputEl) {
    unixInputEl.addEventListener('input', debouncedUnixToDate);
  }

  if (tzSelectEl) {
    tzSelectEl.addEventListener('change', handleUnixToDate);
  }

  if (dateInputEl) {
    dateInputEl.addEventListener('input', debouncedDateToUnix);
  }

  if (btnUnixToDate) {
    btnUnixToDate.addEventListener('click', () => {
      handleUnixToDate();
      if (typeof window.trackToolUse === 'function') window.trackToolUse(TOOL_ID + '-u2d');
    });
  }

  if (btnDateToUnix) {
    btnDateToUnix.addEventListener('click', () => {
      handleDateToUnix();
      if (typeof window.trackToolUse === 'function') window.trackToolUse(TOOL_ID + '-d2u');
    });
  }

  // Add click-to-copy for all output spans dynamically
  document.querySelectorAll('.output-value').forEach(span => {
    span.style.cursor = 'pointer';
    span.title = 'Click to copy';
    span.addEventListener('click', (e) => {
      const text = e.target.textContent;
      if (text === '-' || text.startsWith('Error')) return;
      
      if (typeof window.copyToClipboard === 'function') {
         // Create a temporary button element for the copy utility to attach state to
         const tempBtn = document.createElement('button');
         tempBtn.textContent = 'Copy';
         window.copyToClipboard(text, tempBtn);
         if (typeof window.showToast === 'function') window.showToast('Copied to clipboard');
      } else {
         navigator.clipboard.writeText(text);
         if (typeof window.showToast === 'function') window.showToast('Copied to clipboard');
      }
    });
  });

  // --- Initialization ---

  function init() {
    if (typeof window.loadToolInput === 'function') {
      const savedUnix = window.loadToolInput(TOOL_ID + '-unix');
      const savedTz = window.loadToolInput(TOOL_ID + '-tz');
      const savedDate = window.loadToolInput(TOOL_ID + '-date');

      if (savedUnix && unixInputEl) unixInputEl.value = savedUnix;
      if (savedTz && tzSelectEl) tzSelectEl.value = savedTz;
      if (savedDate && dateInputEl) dateInputEl.value = savedDate;

      if (savedUnix) handleUnixToDate();
      if (savedDate) handleDateToUnix();
    }
  }

  init();

})();