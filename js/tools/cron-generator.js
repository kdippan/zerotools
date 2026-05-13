/**
 * ZeroTools - Cron Expression Generator
 * File: js/tools/cron-generator.js
 */

(function () {
  const TOOL_ID = 'cron-generator';

  // --- DOM Elements ---
  const cronInputEl = document.getElementById('cron-input');
  const cronOutputEl = document.getElementById('cron-output');
  
  const expMinuteEl = document.getElementById('exp-minute');
  const expHourEl = document.getElementById('exp-hour');
  const expDomEl = document.getElementById('exp-dom');
  const expMonthEl = document.getElementById('exp-month');
  const expDowEl = document.getElementById('exp-dow');
  
  const presetSelectEl = document.getElementById('preset-select');
  
  const uiMinuteEl = document.getElementById('ui-minute');
  const uiHourEl = document.getElementById('ui-hour');
  const uiDomEl = document.getElementById('ui-dom');
  const uiMonthEl = document.getElementById('ui-month');
  
  // Day of week checkboxes
  const dowCheckboxes = [
    document.getElementById('dow-sun'),
    document.getElementById('dow-mon'),
    document.getElementById('dow-tue'),
    document.getElementById('dow-wed'),
    document.getElementById('dow-thu'),
    document.getElementById('dow-fri'),
    document.getElementById('dow-sat')
  ];

  const btnCopy = document.getElementById('btn-copy');
  const btnClear = document.getElementById('btn-clear');
  const btnSample = document.getElementById('btn-sample');
  const btnPaste = document.getElementById('btn-paste');

  // Next run times list
  const nextRunsListEl = document.getElementById('next-runs-list');
  const statusEl = document.getElementById('status');

  // --- Constants ---
  const PRESETS = {
    '@hourly': '0 * * * *',
    '@daily': '0 0 * * *',
    '@weekly': '0 0 * * 0',
    '@monthly': '0 0 1 * *',
    '@yearly': '0 0 1 1 *',
    'weekday9am': '0 9 * * 1-5',
    'businesshours': '0 9-17 * * 1-5'
  };

  const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // --- Utility Functions ---

  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  // --- Cron Parsing & Formatting ---

  // Simple pure JS cron parser (simplified for common web tool use cases)
  function parseCron(expr) {
    const parts = expr.trim().split(/\s+/);
    if (parts.length < 5) return null;
    
    // Support standard 5-part cron. (Ignore seconds or years if passed as 6/7 parts)
    return {
      minute: parts[0],
      hour: parts[1],
      dom: parts[2],
      month: parts[3],
      dow: parts[4]
    };
  }

  function formatCronSegment(value, type) {
    if (value === '*') return 'Every ' + type;
    
    // Handle step values (*/5)
    if (value.startsWith('*/')) {
      return `Every ${value.substring(2)} ${type}s`;
    }
    
    // Handle ranges (1-5)
    if (value.includes('-')) {
      const [start, end] = value.split('-');
      return `From ${start} to ${end}`;
    }

    // Handle lists (1,2,3)
    if (value.includes(',')) {
      return `At ${value}`;
    }
    
    return `At ${type} ${value}`;
  }

  function explainCron(cronObj) {
    if (!cronObj) return;

    // Special formatting for specific fields to make it human-readable
    let minText = formatCronSegment(cronObj.minute, 'minute');
    if (cronObj.minute !== '*' && !cronObj.minute.includes('/') && !cronObj.minute.includes('-') && !cronObj.minute.includes(',')) {
       minText = `At minute ${cronObj.minute.padStart(2, '0')}`;
    }

    let hourText = formatCronSegment(cronObj.hour, 'hour');
    if (cronObj.hour !== '*' && !cronObj.hour.includes('/') && !cronObj.hour.includes('-') && !cronObj.hour.includes(',')) {
       hourText = `Past hour ${cronObj.hour.padStart(2, '0')}`;
    }

    let domText = cronObj.dom === '*' ? 'Every day' : `On day ${cronObj.dom}`;
    if (cronObj.dom.startsWith('*/')) domText = `Every ${cronObj.dom.substring(2)} days`;

    let monthText = cronObj.month === '*' ? 'Every month' : `In month ${cronObj.month}`;
    if (!isNaN(cronObj.month) && cronObj.month >= 1 && cronObj.month <= 12) {
      monthText = `In ${MONTH_NAMES[cronObj.month - 1]}`;
    }

    let dowText = cronObj.dow === '*' ? 'Every day of week' : `On day of week ${cronObj.dow}`;
    if (!isNaN(cronObj.dow) && cronObj.dow >= 0 && cronObj.dow <= 6) {
       dowText = `On ${DAY_NAMES[cronObj.dow]}`;
    } else if (cronObj.dow === '1-5') {
       dowText = 'Monday through Friday';
    }

    if (expMinuteEl) expMinuteEl.textContent = minText;
    if (expHourEl) expHourEl.textContent = hourText;
    if (expDomEl) expDomEl.textContent = domText;
    if (expMonthEl) expMonthEl.textContent = monthText;
    if (expDowEl) expDowEl.textContent = dowText;
  }

  // Very basic "Next Run" calculator (predictive logic without a heavy library)
  // This is a naive implementation for the top common patterns to avoid importing node-cron client-side.
  function calculateNextRuns(cronObj, count = 5) {
    if (!cronObj) return [];
    
    let runs = [];
    let current = new Date();
    
    // Safety break to prevent infinite loops in weird cron patterns
    let safety = 0; 
    
    // Simplistic forward-stepping engine. Not perfect for complex ranges/lists, 
    // but works well enough for standard UI builder outputs (*, */5, specific numbers)
    while (runs.length < count && safety < 1000) {
      safety++;
      current.setMinutes(current.getMinutes() + 1);
      
      const m = current.getMinutes();
      const h = current.getHours();
      const dom = current.getDate();
      const mo = current.getMonth() + 1; // 1-12
      const dow = current.getDay(); // 0-6

      if (matchCronPart(cronObj.month, mo) && 
          matchCronPart(cronObj.dom, dom) && 
          matchCronPart(cronObj.dow, dow) && 
          matchCronPart(cronObj.hour, h) && 
          matchCronPart(cronObj.minute, m)) {
          
          runs.push(new Date(current));
          // Jump ahead based on smallest unit to save cycles
          if (cronObj.minute === '*' && cronObj.hour === '*') {
            // Nothing to optimize easily here
          } else if (cronObj.minute !== '*') {
            // we hit a target minute, don't check next 59
             current.setMinutes(current.getMinutes() + 59);
          }
      }
    }
    return runs;
  }

  function matchCronPart(expr, val) {
    if (expr === '*') return true;
    if (expr == val) return true;
    
    if (expr.startsWith('*/')) {
      const step = parseInt(expr.substring(2), 10);
      return val % step === 0;
    }
    
    if (expr.includes('-')) {
      const [start, end] = expr.split('-').map(Number);
      return val >= start && val <= end;
    }
    
    if (expr.includes(',')) {
      const parts = expr.split(',').map(Number);
      return parts.includes(val);
    }
    
    return false;
  }

  function renderNextRuns(runs) {
    if (!nextRunsListEl) return;
    
    if (runs.length === 0) {
      nextRunsListEl.innerHTML = '<li style="color: var(--text-tertiary); padding: 8px 0;">Cannot compute next runs for this pattern.</li>';
      return;
    }

    let html = '';
    runs.forEach(date => {
      const formatted = date.toLocaleString('en-US', { 
        weekday: 'short', 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric', 
        hour: '2-digit', 
        minute: '2-digit' 
      });
      html += `<li style="padding: 6px 0; border-bottom: 1px solid var(--border-subtle); color: var(--text-primary); font-family: var(--font-mono); font-size: var(--text-sm);">${formatted}</li>`;
    });
    
    nextRunsListEl.innerHTML = html;
  }

  // --- Sync Logic ---

  // When User Types into the String Input
  function handleInputStringChange() {
    if (!cronInputEl) return;
    
    const expr = cronInputEl.value;
    const parsed = parseCron(expr);
    
    if (parsed) {
      explainCron(parsed);
      const runs = calculateNextRuns(parsed);
      renderNextRuns(runs);
      syncUIFromParsed(parsed);
      
      if (statusEl) statusEl.innerHTML = `<span style="color: var(--color-success);">✓ Valid Expression</span>`;
    } else {
      if (statusEl) statusEl.innerHTML = `<span style="color: var(--color-error);">✗ Invalid Format</span> (Need 5 parts)`;
    }
    
    saveState();
  }

  // When User uses the Dropdowns/Checkboxes
  function handleUIChange() {
    let min = uiMinuteEl ? uiMinuteEl.value : '*';
    let hour = uiHourEl ? uiHourEl.value : '*';
    let dom = uiDomEl ? uiDomEl.value : '*';
    let month = uiMonthEl ? uiMonthEl.value : '*';
    
    // Calculate Days of week
    let dowArr = [];
    dowCheckboxes.forEach((cb, index) => {
      if (cb && cb.checked) dowArr.push(index); // Sun=0, Sat=6
    });
    
    let dow = '*';
    if (dowArr.length === 0 || dowArr.length === 7) {
      dow = '*';
    } else if (dowArr.length === 5 && dowArr[0]===1 && dowArr[4]===5) {
      dow = '1-5'; // Common M-F pattern
    } else {
      dow = dowArr.join(',');
    }

    const newCronStr = `${min} ${hour} ${dom} ${month} ${dow}`;
    
    if (cronInputEl) {
      cronInputEl.value = newCronStr;
      handleInputStringChange(); // Trigger the downstream updates
    }
  }

  function syncUIFromParsed(parsed) {
    if (uiMinuteEl) uiMinuteEl.value = ['*'].includes(parsed.minute) ? '*' : (parsed.minute.includes('*/') || parsed.minute.includes(',') ? 'custom' : parsed.minute);
    if (uiHourEl) uiHourEl.value = ['*'].includes(parsed.hour) ? '*' : (parsed.hour.includes('*/') || parsed.hour.includes(',') ? 'custom' : parsed.hour);
    if (uiDomEl) uiDomEl.value = ['*'].includes(parsed.dom) ? '*' : (parsed.dom.includes('*/') || parsed.dom.includes(',') ? 'custom' : parsed.dom);
    if (uiMonthEl) uiMonthEl.value = ['*'].includes(parsed.month) ? '*' : (parsed.month.includes('*/') || parsed.month.includes(',') ? 'custom' : parsed.month);

    if (parsed.dow === '*') {
      dowCheckboxes.forEach(cb => { if(cb) cb.checked = false; });
    } else if (parsed.dow === '1-5') {
       dowCheckboxes.forEach((cb, i) => { if(cb) cb.checked = (i >= 1 && i <= 5); });
    } else {
      const parts = parsed.dow.split(',');
      dowCheckboxes.forEach((cb, i) => { 
        if(cb) cb.checked = parts.includes(i.toString()); 
      });
    }
  }


  // --- Event Listeners ---

  if (cronInputEl) {
    cronInputEl.addEventListener('input', debounce(handleInputStringChange, 300));
  }

  [uiMinuteEl, uiHourEl, uiDomEl, uiMonthEl].forEach(el => {
    if (el) el.addEventListener('change', handleUIChange);
  });

  dowCheckboxes.forEach(cb => {
    if (cb) cb.addEventListener('change', handleUIChange);
  });

  if (presetSelectEl) {
    presetSelectEl.addEventListener('change', (e) => {
      const val = e.target.value;
      if (PRESETS[val] && cronInputEl) {
        cronInputEl.value = PRESETS[val];
        handleInputStringChange();
      }
      e.target.value = ""; // Reset
    });
  }

  if (btnCopy) {
    btnCopy.addEventListener('click', () => {
      if (cronInputEl && cronInputEl.value) {
        if (typeof window.copyToClipboard === 'function') {
          window.copyToClipboard(cronInputEl.value, btnCopy);
        } else {
          navigator.clipboard.writeText(cronInputEl.value);
        }
        if (typeof window.trackCopy === 'function') window.trackCopy(TOOL_ID);
      }
    });
  }

  if (btnClear) {
    btnClear.addEventListener('click', () => {
      if (cronInputEl) cronInputEl.value = '* * * * *';
      handleInputStringChange();
      if (typeof window.saveToolInput === 'function') {
        window.saveToolInput(TOOL_ID, '');
      }
    });
  }

  if (btnSample) {
    btnSample.addEventListener('click', () => {
      if (cronInputEl) cronInputEl.value = '0 9 * * 1-5'; // Weekdays at 9am
      handleInputStringChange();
    });
  }

  if (btnPaste) {
    btnPaste.addEventListener('click', async () => {
      try {
        const text = await navigator.clipboard.readText();
        if (cronInputEl) {
          cronInputEl.value = text;
          handleInputStringChange();
        }
      } catch (err) {
        if (typeof window.showToast === 'function') {
          window.showToast('Clipboard permission denied.', 'error');
        }
      }
    });
  }


  // --- State Management ---
  function saveState() {
    if (typeof window.saveToolInput !== 'function') return;
    if (cronInputEl) window.saveToolInput(TOOL_ID + '-input', cronInputEl.value);
  }

  function loadState() {
    if (typeof window.loadToolInput !== 'function') return false;
    const savedInput = window.loadToolInput(TOOL_ID + '-input');

    if (savedInput && cronInputEl) {
      cronInputEl.value = savedInput;
      return true;
    }
    return false;
  }

  // --- Initialization ---
  function init() {
    // Generate DOM options (1-31)
    if (uiDomEl) {
      for(let i=1; i<=31; i++) {
        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = i;
        uiDomEl.appendChild(opt);
      }
    }
    
    // Generate Hour options (0-23)
    if (uiHourEl) {
      for(let i=0; i<=23; i++) {
        const opt = document.createElement('option');
        opt.value = i;
        opt.textContent = i.toString().padStart(2, '0');
        uiHourEl.appendChild(opt);
      }
    }

    if (loadState()) {
      handleInputStringChange();
    } else {
      if (cronInputEl) cronInputEl.value = '* * * * *';
      handleInputStringChange();
    }
  }

  init();

})();