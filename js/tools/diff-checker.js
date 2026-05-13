/**
 * ZeroTools - Diff Checker
 * File: js/tools/diff-checker.js
 */

(function () {
  const TOOL_ID = 'diff-checker';
  const originalInputEl = document.getElementById('original');
  const modifiedInputEl = document.getElementById('modified');
  const outputEl = document.getElementById('diff-output');
  const statusEl = document.getElementById('status');
  
  const btnRun = document.getElementById('btn-run');
  const btnClear = document.getElementById('btn-clear');
  const btnSwap = document.getElementById('btn-swap');
  const btnSample = document.getElementById('btn-sample');

  const modeRadios = document.querySelectorAll('input[name="diff-mode"]');

  const SAMPLE_ORIGINAL = `{
  "name": "ZeroTools",
  "version": "1.0.0",
  "description": "Privacy-first developer utilities",
  "scripts": {
    "start": "serve .",
    "build": "echo 'No build needed!'"
  },
  "dependencies": {},
  "author": "kdippan",
  "license": "MIT"
}`;

  const SAMPLE_MODIFIED = `{
  "name": "ZeroTools Project",
  "version": "1.0.1",
  "description": "Privacy-first developer utilities",
  "scripts": {
    "start": "serve .",
    "test": "echo 'No tests yet'"
  },
  "dependencies": {
    "marked": "^11.1.1"
  },
  "author": "Dippan Bhusal",
  "license": "MIT"
}`;

  
  function escapeHtml(unsafe) {
    return (unsafe || '').toString()
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function getMode() {
    let mode = 'word'; // Default
    if (modeRadios.length > 0) {
      modeRadios.forEach(r => { if (r.checked) mode = r.value; });
    }
    return mode;
  }


  function processDiff() {
    if (!outputEl) return;
    
    const text1 = originalInputEl ? originalInputEl.value : '';
    const text2 = modifiedInputEl ? modifiedInputEl.value : '';

    if (!text1 && !text2) {
      outputEl.innerHTML = '<div style="color: var(--text-tertiary); text-align: center; padding: var(--space-8);">Enter text in both fields to see differences...</div>';
      if (statusEl) statusEl.innerHTML = '';
      return;
    }

    if (typeof diff_match_patch === 'undefined') {
      outputEl.innerHTML = '<div style="color: var(--color-error); padding: var(--space-4);">Error: diff_match_patch library failed to load.</div>';
      return;
    }

    const dmp = new diff_match_patch();
    const mode = getMode();

    let diffs = [];

    if (mode === 'char') {
      diffs = dmp.diff_main(text1, text2);
      dmp.diff_cleanupSemantic(diffs);
    } else if (mode === 'line') {
      const a = dmp.diff_linesToChars_(text1, text2);
      const lineText1 = a.chars1;
      const lineText2 = a.chars2;
      const lineArray = a.lineArray;
      
      diffs = dmp.diff_main(lineText1, lineText2, false);
      dmp.diff_charsToLines_(diffs, lineArray);
      dmp.diff_cleanupSemantic(diffs);
    } else {
      // Word-level diff (Best default for code/text)
      // Custom implementation to achieve word diff using DMP
      const b = diff_wordsToChars_(text1, text2);
      const wordText1 = b.chars1;
      const wordText2 = b.chars2;
      const wordArray = b.lineArray;

      diffs = dmp.diff_main(wordText1, wordText2, false);
      dmp.diff_charsToLines_(diffs, wordArray);
      dmp.diff_cleanupSemantic(diffs);
    }

    renderDiff(diffs);
    saveState();
  }

  function diff_wordsToChars_(text1, text2) {
    let lineArray = [];  
    let lineHash = {};   
    lineArray[0] = '';
    
    function diff_linesToCharsMunge_(text) {
      let chars = "";
      const lineArrayMatch = text.match(/\w+|\s+|[^\w\s]+/g) || [];
      
      for (let i = 0; i < lineArrayMatch.length; i++) {
        let line = lineArrayMatch[i];
        if (lineHash.hasOwnProperty(line)) {
          chars += String.fromCharCode(lineHash[line]);
        } else {
          let hash = lineArray.length;
          lineHash[line] = hash;
          lineArray[hash] = line;
          chars += String.fromCharCode(hash);
        }
      }
      return chars;
    }

    const chars1 = diff_linesToCharsMunge_(text1);
    const chars2 = diff_linesToCharsMunge_(text2);
    return { chars1: chars1, chars2: chars2, lineArray: lineArray };
  }

  function renderDiff(diffs) {
    let html = '<div style="font-family: var(--font-mono); font-size: var(--text-sm); line-height: 1.6; white-space: pre-wrap; word-break: break-all;">';
    
    let stats = { added: 0, removed: 0, unchanged: 0 };
    
    // Simple inline rendering
    for (let i = 0; i < diffs.length; i++) {
      let op = diffs[i][0];    
      let data = diffs[i][1];  
      let text = escapeHtml(data);
      const linesInChunk = (data.match(/\n/g) || []).length || 1;

      switch (op) {
        case 1: // Insert (Added)
          html += `<span style="background: var(--accent-dim); color: var(--color-success); border-radius: 2px;">${text}</span>`;
          stats.added += linesInChunk;
          break;
        case -1: // Delete (Removed)
          html += `<span style="background: rgba(255, 77, 77, 0.15); color: var(--color-error); text-decoration: line-through; border-radius: 2px;">${text}</span>`;
          stats.removed += linesInChunk;
          break;
        case 0: // Equal (Unchanged)
          html += `<span style="color: var(--text-secondary);">${text}</span>`;
          stats.unchanged += linesInChunk;
          break;
      }
    }
    html += '</div>';
    
    outputEl.innerHTML = html;

    if (statusEl) {
       statusEl.innerHTML = `<span style="color: var(--color-success);">+ ${stats.added}</span> insertions <span style="color: var(--border-strong);">·</span> <span style="color: var(--color-error);">- ${stats.removed}</span> deletions <span style="color: var(--border-strong);">·</span> <span style="color: var(--text-secondary);">${stats.unchanged}</span> unchanged`;
    }
  }

  if (btnRun) {
    btnRun.addEventListener('click', () => {
      processDiff();
      if (typeof window.trackToolUse === 'function') window.trackToolUse(TOOL_ID);
    });
  }

  if (btnClear) {
    btnClear.addEventListener('click', () => {
      if (originalInputEl) originalInputEl.value = '';
      if (modifiedInputEl) modifiedInputEl.value = '';
      if (outputEl) outputEl.innerHTML = '<div style="color: var(--text-tertiary); text-align: center; padding: var(--space-8);">Enter text in both fields to see differences...</div>';
      if (statusEl) statusEl.innerHTML = '';
      
      if (typeof window.saveToolInput === 'function') {
        window.saveToolInput(TOOL_ID + '-original', '');
        window.saveToolInput(TOOL_ID + '-modified', '');
      }
    });
  }

  if (btnSwap) {
    btnSwap.addEventListener('click', () => {
      if (!originalInputEl || !modifiedInputEl) return;
      const temp = originalInputEl.value;
      originalInputEl.value = modifiedInputEl.value;
      modifiedInputEl.value = temp;
      processDiff();
    });
  }

  if (btnSample) {
    btnSample.addEventListener('click', () => {
      if (originalInputEl) originalInputEl.value = SAMPLE_ORIGINAL;
      if (modifiedInputEl) modifiedInputEl.value = SAMPLE_MODIFIED;
      // Select Word mode for best code sample viewing
      if (modeRadios[1]) modeRadios[1].checked = true; 
      processDiff();
    });
  }

  modeRadios.forEach(r => {
    r.addEventListener('change', processDiff);
  });

  function saveState() {
    if (typeof window.saveToolInput !== 'function') return;
    if (originalInputEl) window.saveToolInput(TOOL_ID + '-original', originalInputEl.value);
    if (modifiedInputEl) window.saveToolInput(TOOL_ID + '-modified', modifiedInputEl.value);
  }

  function loadState() {
    if (typeof window.loadToolInput !== 'function') return false;
    
    const savedOriginal = window.loadToolInput(TOOL_ID + '-original');
    const savedModified = window.loadToolInput(TOOL_ID + '-modified');

    if (savedOriginal && originalInputEl) originalInputEl.value = savedOriginal;
    if (savedModified && modifiedInputEl) modifiedInputEl.value = savedModified;

    return savedOriginal || savedModified;
  }

  function init() {
    if (loadState()) {
      processDiff();
    }
  }

  if (typeof diff_match_patch !== 'undefined') {
    init();
  } else {
    window.addEventListener('load', init);
  }

})();