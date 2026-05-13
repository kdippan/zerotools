/**
 * ZeroTools - Chmod Calculator
 * File: js/tools/chmod-calculator.js
 */

(function () {
  const TOOL_ID = 'chmod-calculator';

  // --- DOM Elements ---
  
  // Checkboxes
  const permInputs = {
    owner: {
      read: document.getElementById('perm-owner-read'),
      write: document.getElementById('perm-owner-write'),
      execute: document.getElementById('perm-owner-execute')
    },
    group: {
      read: document.getElementById('perm-group-read'),
      write: document.getElementById('perm-group-write'),
      execute: document.getElementById('perm-group-execute')
    },
    others: {
      read: document.getElementById('perm-others-read'),
      write: document.getElementById('perm-others-write'),
      execute: document.getElementById('perm-others-execute')
    },
    special: {
      setuid: document.getElementById('perm-special-setuid'),
      setgid: document.getElementById('perm-special-setgid'),
      sticky: document.getElementById('perm-special-sticky')
    }
  };

  // Outputs
  const octalInputEl = document.getElementById('octal-input'); // Acts as both input and output
  const octalOutputEl = document.getElementById('octal-output');
  const symbolicOutputEl = document.getElementById('symbolic-output');
  const commandOutputEl = document.getElementById('command-output');
  const numericFullOutputEl = document.getElementById('numeric-full-output');

  // Buttons
  const btnClear = document.getElementById('btn-clear');
  const presetBtns = document.querySelectorAll('.preset-btn');
  
  // Copy Buttons
  const btnCopyOctal = document.getElementById('btn-copy-octal');
  const btnCopySymbolic = document.getElementById('btn-copy-symbolic');
  const btnCopyCommand = document.getElementById('btn-copy-command');
  const btnCopyNumeric = document.getElementById('btn-copy-numeric');

  const statusEl = document.getElementById('status');

  // --- Constants ---
  const CHMOD_VALUES = {
    read: 4,
    write: 2,
    execute: 1
  };
  
  const SPECIAL_VALUES = {
    setuid: 4,
    setgid: 2,
    sticky: 1
  };

  // --- Core Logic ---

  function calculateFromCheckboxes() {
    let special = 0;
    let owner = 0;
    let group = 0;
    let others = 0;

    // Special
    if (permInputs.special.setuid && permInputs.special.setuid.checked) special += SPECIAL_VALUES.setuid;
    if (permInputs.special.setgid && permInputs.special.setgid.checked) special += SPECIAL_VALUES.setgid;
    if (permInputs.special.sticky && permInputs.special.sticky.checked) special += SPECIAL_VALUES.sticky;

    // Owner
    if (permInputs.owner.read && permInputs.owner.read.checked) owner += CHMOD_VALUES.read;
    if (permInputs.owner.write && permInputs.owner.write.checked) owner += CHMOD_VALUES.write;
    if (permInputs.owner.execute && permInputs.owner.execute.checked) owner += CHMOD_VALUES.execute;

    // Group
    if (permInputs.group.read && permInputs.group.read.checked) group += CHMOD_VALUES.read;
    if (permInputs.group.write && permInputs.group.write.checked) group += CHMOD_VALUES.write;
    if (permInputs.group.execute && permInputs.group.execute.checked) group += CHMOD_VALUES.execute;

    // Others
    if (permInputs.others.read && permInputs.others.read.checked) others += CHMOD_VALUES.read;
    if (permInputs.others.write && permInputs.others.write.checked) others += CHMOD_VALUES.write;
    if (permInputs.others.execute && permInputs.others.execute.checked) others += CHMOD_VALUES.execute;

    const baseOctal = `${owner}${group}${others}`;
    const fullOctal = special > 0 ? `${special}${baseOctal}` : baseOctal;
    const numericFull = special > 0 ? `0${special}${baseOctal}` : `0${baseOctal}`;

    let symbolic = '';
    
    // Symbolic Owner
    symbolic += (owner & CHMOD_VALUES.read) ? 'r' : '-';
    symbolic += (owner & CHMOD_VALUES.write) ? 'w' : '-';
    if (special & SPECIAL_VALUES.setuid) {
        symbolic += (owner & CHMOD_VALUES.execute) ? 's' : 'S';
    } else {
        symbolic += (owner & CHMOD_VALUES.execute) ? 'x' : '-';
    }

    // Symbolic Group
    symbolic += (group & CHMOD_VALUES.read) ? 'r' : '-';
    symbolic += (group & CHMOD_VALUES.write) ? 'w' : '-';
    if (special & SPECIAL_VALUES.setgid) {
        symbolic += (group & CHMOD_VALUES.execute) ? 's' : 'S';
    } else {
        symbolic += (group & CHMOD_VALUES.execute) ? 'x' : '-';
    }

    // Symbolic Others
    symbolic += (others & CHMOD_VALUES.read) ? 'r' : '-';
    symbolic += (others & CHMOD_VALUES.write) ? 'w' : '-';
    if (special & SPECIAL_VALUES.sticky) {
        symbolic += (others & CHMOD_VALUES.execute) ? 't' : 'T';
    } else {
        symbolic += (others & CHMOD_VALUES.execute) ? 'x' : '-';
    }

    updateOutputs(fullOctal, symbolic, numericFull);
  }

  function updateOutputs(octalStr, symbolicStr, numericFullStr) {
    if (octalInputEl && document.activeElement !== octalInputEl) {
      octalInputEl.value = octalStr;
    }
    
    if (octalOutputEl) octalOutputEl.value = octalStr;
    if (symbolicOutputEl) symbolicOutputEl.value = symbolicStr;
    if (commandOutputEl) commandOutputEl.value = `chmod ${octalStr} filename`;
    if (numericFullOutputEl) numericFullOutputEl.value = numericFullStr;

    if (statusEl) {
      statusEl.innerHTML = `<span style="color: var(--color-success);">✓ Synced</span>`;
    }

    saveState();
  }

  function applyOctalToUI(octalStr) {
    // Strip leading zero if typed
    let cleanVal = octalStr.replace(/^0+/, '');
    
    // Pad to 3 digits minimum, 4 maximum
    if (cleanVal.length > 4) cleanVal = cleanVal.substring(0, 4);
    if (cleanVal.length < 3) cleanVal = cleanVal.padStart(3, '0');

    let special = 0, owner = 0, group = 0, others = 0;

    if (cleanVal.length === 4) {
      special = parseInt(cleanVal[0], 10);
      owner = parseInt(cleanVal[1], 10);
      group = parseInt(cleanVal[2], 10);
      others = parseInt(cleanVal[3], 10);
    } else {
      owner = parseInt(cleanVal[0], 10);
      group = parseInt(cleanVal[1], 10);
      others = parseInt(cleanVal[2], 10);
    }

    // Update Special Checkboxes
    if (permInputs.special.setuid) permInputs.special.setuid.checked = (special & SPECIAL_VALUES.setuid) !== 0;
    if (permInputs.special.setgid) permInputs.special.setgid.checked = (special & SPECIAL_VALUES.setgid) !== 0;
    if (permInputs.special.sticky) permInputs.special.sticky.checked = (special & SPECIAL_VALUES.sticky) !== 0;

    // Update Owner Checkboxes
    if (permInputs.owner.read) permInputs.owner.read.checked = (owner & CHMOD_VALUES.read) !== 0;
    if (permInputs.owner.write) permInputs.owner.write.checked = (owner & CHMOD_VALUES.write) !== 0;
    if (permInputs.owner.execute) permInputs.owner.execute.checked = (owner & CHMOD_VALUES.execute) !== 0;

    // Update Group Checkboxes
    if (permInputs.group.read) permInputs.group.read.checked = (group & CHMOD_VALUES.read) !== 0;
    if (permInputs.group.write) permInputs.group.write.checked = (group & CHMOD_VALUES.write) !== 0;
    if (permInputs.group.execute) permInputs.group.execute.checked = (group & CHMOD_VALUES.execute) !== 0;

    // Update Others Checkboxes
    if (permInputs.others.read) permInputs.others.read.checked = (others & CHMOD_VALUES.read) !== 0;
    if (permInputs.others.write) permInputs.others.write.checked = (others & CHMOD_VALUES.write) !== 0;
    if (permInputs.others.execute) permInputs.others.execute.checked = (others & CHMOD_VALUES.execute) !== 0;

    calculateFromCheckboxes();
  }

  // --- Event Listeners ---

  // Bind all checkboxes
  const allCheckboxes = document.querySelectorAll('.perm-checkbox');
  allCheckboxes.forEach(cb => {
    cb.addEventListener('change', calculateFromCheckboxes);
  });

  // Reverse Input (Typing Octal)
  if (octalInputEl) {
    octalInputEl.addEventListener('input', (e) => {
      // Allow only numbers 0-7
      let val = e.target.value.replace(/[^0-7]/g, '');
      if (val !== e.target.value) {
        e.target.value = val;
      }

      if (val.length >= 3) {
        applyOctalToUI(val);
      } else {
        if (statusEl) statusEl.innerHTML = `<span style="color: var(--text-tertiary);">Waiting for complete octal...</span>`;
      }
    });
  }

  // Presets
  presetBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      const octal = e.target.dataset.octal;
      if (octal) {
        if (octalInputEl) octalInputEl.value = octal;
        applyOctalToUI(octal);
      }
    });
  });

  if (btnClear) {
    btnClear.addEventListener('click', () => {
      allCheckboxes.forEach(cb => cb.checked = false);
      if (octalInputEl) octalInputEl.value = '000';
      calculateFromCheckboxes();
      
      if (typeof window.saveToolInput === 'function') {
        window.saveToolInput(TOOL_ID, '');
      }
    });
  }

  // Copy Buttons
  const copyActions = [
    { btn: btnCopyOctal, input: octalOutputEl },
    { btn: btnCopySymbolic, input: symbolicOutputEl },
    { btn: btnCopyCommand, input: commandOutputEl },
    { btn: btnCopyNumeric, input: numericFullOutputEl }
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

  // --- State Management ---
  function saveState() {
    if (typeof window.saveToolInput !== 'function') return;
    if (octalInputEl) window.saveToolInput(TOOL_ID, octalInputEl.value);
  }

  function loadState() {
    if (typeof window.loadToolInput !== 'function') return false;
    
    const savedInput = window.loadToolInput(TOOL_ID);

    if (savedInput) {
       applyOctalToUI(savedInput);
       return true;
    }
    return false;
  }

  // --- Initialization ---
  function init() {
    if (!loadState()) {
      // Default standard web directory perm if no state
      applyOctalToUI("755"); 
    }
  }

  init();

})();