/**
 * ZeroTools - Word & Character Counter
 * File: js/tools/word-counter.js
 */

(function () {
  const TOOL_ID = 'word-counter';

  // --- DOM Elements ---
  const inputEl = document.getElementById('input');
  
  // Stat Cards
  const statWordsEl = document.getElementById('stat-words');
  const statCharsEl = document.getElementById('stat-chars');
  const statCharsNoSpaceEl = document.getElementById('stat-chars-nospace');
  const statSentencesEl = document.getElementById('stat-sentences');
  const statParagraphsEl = document.getElementById('stat-paragraphs');
  const statReadTimeEl = document.getElementById('stat-read-time');
  const statSpeakTimeEl = document.getElementById('stat-speak-time');

  // Keyword Density
  const kwInputEl = document.getElementById('kw-input');
  const kwCountEl = document.getElementById('kw-count');
  const kwPercentEl = document.getElementById('kw-percent');

  // Top Words Table
  const topWordsTableEl = document.getElementById('top-words-table');

  // Character Limit Warning
  const limitInputEl = document.getElementById('char-limit');
  const limitWarningEl = document.getElementById('limit-warning');
  const limitProgressBarEl = document.getElementById('limit-progress-bar');
  const limitProgressContainerEl = document.getElementById('limit-progress-container');

  const btnClear = document.getElementById('btn-clear');
  const btnPaste = document.getElementById('btn-paste');
  const btnSample = document.getElementById('btn-sample');

  // --- Constants ---
  const WPM_READING = 238; // Average adult reading speed
  const WPM_SPEAKING = 130; // Average conversational speaking speed

  const SAMPLE_TEXT = `Privacy is not an option, and it shouldn't be the price we accept for just getting on the internet. It is a fundamental human right. 

When developers build tools that require registration, cloud uploads, and analytics tracking just to format a JSON string or decode a Base64 file, they break the trust between user and tool. The modern web has become bloated with utilities that extract more value than they provide.

ZeroTools was built with a different philosophy:
1. Everything runs client-side.
2. No data ever touches a server.
3. No accounts are required.

By leveraging the native power of the modern browser, we can build complex developer utilities—from cryptographic hash generators to intricate regex testers—entirely offline. This ensures that sensitive source code, API tokens, and private data remain exactly where they belong: on your machine.`;

  // --- Core Processing Logic ---

  function countWords(text) {
    // Matches sequences of non-whitespace characters
    const words = text.match(/\S+/g);
    return words ? words.length : 0;
  }

  function countSentences(text) {
    // Naive split on punctuation followed by space or EOF
    const sentences = text.match(/[^.!?]+[.!?]+/g);
    return sentences ? sentences.length : 0;
  }

  function countParagraphs(text) {
    if (!text.trim()) return 0;
    // Split by double newlines or more
    const paragraphs = text.split(/\n\s*\n/);
    return paragraphs.length;
  }

  function formatTime(minutes) {
    if (minutes < 1) return '< 1 min';
    const mins = Math.floor(minutes);
    const secs = Math.round((minutes - mins) * 60);
    if (mins === 0) return `${secs} sec`;
    if (secs === 0) return `${mins} min`;
    return `${mins}m ${secs}s`;
  }

  function analyzeKeywordDensity(text, targetWord) {
    if (!text || !targetWord) return { count: 0, percent: 0 };
    
    const words = text.match(/\S+/g) || [];
    const totalWords = words.length;
    if (totalWords === 0) return { count: 0, percent: 0 };

    const targetLower = targetWord.toLowerCase().trim();
    
    // Count exact word matches (case insensitive, stripping punctuation)
    let count = 0;
    for (let w of words) {
       const cleanWord = w.replace(/[.,/#!$%^&*;:{}=\-_`~()]/g, "").toLowerCase();
       if (cleanWord === targetLower) count++;
    }

    const percent = ((count / totalWords) * 100).toFixed(2);
    return { count, percent };
  }

  function calculateTopWords(text, limit = 10) {
    if (!text.trim()) return [];
    
    const wordsMatch = text.toLowerCase().match(/\b[\w']+\b/g);
    if (!wordsMatch) return [];

    const totalWords = wordsMatch.length;
    const frequency = {};
    
    // Common English stop words to optionally filter out (omitted for pure counting, 
    // but useful if we wanted a "meaningful keywords" feature). We will count all words.
    
    wordsMatch.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });

    const sortedWords = Object.keys(frequency)
      .map(word => ({
        word: word,
        count: frequency[word],
        percent: ((frequency[word] / totalWords) * 100).toFixed(1)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    return sortedWords;
  }

  function updateLimitWarning(charCount) {
    if (!limitInputEl || !limitProgressContainerEl || !limitProgressBarEl || !limitWarningEl) return;
    
    const limit = parseInt(limitInputEl.value, 10);
    
    if (isNaN(limit) || limit <= 0) {
      limitProgressContainerEl.style.display = 'none';
      limitWarningEl.textContent = '';
      return;
    }

    limitProgressContainerEl.style.display = 'block';
    const percent = Math.min((charCount / limit) * 100, 100);
    limitProgressBarEl.style.width = `${percent}%`;

    if (charCount > limit) {
      limitProgressBarEl.style.backgroundColor = 'var(--color-error)';
      limitWarningEl.textContent = `Over limit by ${charCount - limit} characters`;
      limitWarningEl.style.color = 'var(--color-error)';
    } else if (percent > 90) {
      limitProgressBarEl.style.backgroundColor = 'var(--color-warning)';
      limitWarningEl.textContent = `${limit - charCount} characters remaining`;
      limitWarningEl.style.color = 'var(--color-warning)';
    } else {
      limitProgressBarEl.style.backgroundColor = 'var(--accent)';
      limitWarningEl.textContent = `${charCount} / ${limit}`;
      limitWarningEl.style.color = 'var(--text-secondary)';
    }
  }

  function renderTopWords(topWords) {
    if (!topWordsTableEl) return;

    if (topWords.length === 0) {
      topWordsTableEl.innerHTML = '<tr><td colspan="3" style="text-align: center; color: var(--text-tertiary); padding: 16px;">No words to analyze</td></tr>';
      return;
    }

    const maxCount = topWords[0].count; // For scaling the visual bar

    let html = '';
    topWords.forEach((item, index) => {
      const barWidth = Math.max((item.count / maxCount) * 100, 2); // Minimum 2% width
      html += `
        <tr style="border-bottom: 1px solid var(--border-subtle);">
          <td style="padding: 8px 12px; color: var(--text-primary); font-family: var(--font-sans); width: 30%; word-break: break-all;">
            ${index + 1}. ${item.word}
          </td>
          <td style="padding: 8px 12px; font-family: var(--font-mono); color: var(--syntax-number); width: 20%;">
            ${item.count} <span style="color: var(--text-tertiary); font-size: var(--text-xs);">(${item.percent}%)</span>
          </td>
          <td style="padding: 8px 12px; width: 50%;">
            <div style="width: 100%; background: var(--bg-primary); height: 8px; border-radius: 4px; overflow: hidden;">
              <div style="height: 100%; width: ${barWidth}%; background: var(--accent-dim); border-right: 2px solid var(--accent);"></div>
            </div>
          </td>
        </tr>
      `;
    });

    topWordsTableEl.innerHTML = html;
  }

  function processText() {
    if (!inputEl) return;
    
    const text = inputEl.value;

    // Basic Stats
    const words = countWords(text);
    const chars = text.length;
    const charsNoSpace = text.replace(/\s/g, '').length;
    const sentences = countSentences(text);
    const paragraphs = countParagraphs(text);

    // Reading Times
    const readMins = words / WPM_READING;
    const speakMins = words / WPM_SPEAKING;

    // Update DOM
    if (statWordsEl) statWordsEl.textContent = words;
    if (statCharsEl) statCharsEl.textContent = chars;
    if (statCharsNoSpaceEl) statCharsNoSpaceEl.textContent = charsNoSpace;
    if (statSentencesEl) statSentencesEl.textContent = sentences;
    if (statParagraphsEl) statParagraphsEl.textContent = paragraphs;
    if (statReadTimeEl) statReadTimeEl.textContent = formatTime(readMins);
    if (statSpeakTimeEl) statSpeakTimeEl.textContent = formatTime(speakMins);

    // Limit Warning
    updateLimitWarning(chars);

    // Keyword Density
    if (kwInputEl) {
      const density = analyzeKeywordDensity(text, kwInputEl.value);
      if (kwCountEl) kwCountEl.textContent = density.count;
      if (kwPercentEl) kwPercentEl.textContent = `${density.percent}%`;
    }

    // Top Words
    const topWords = calculateTopWords(text);
    renderTopWords(topWords);

    saveState();
  }

  // --- Event Listeners ---

  // Instant updates on input (no debounce for simple text counting)
  if (inputEl) {
    inputEl.addEventListener('input', processText);
  }

  if (kwInputEl) {
    kwInputEl.addEventListener('input', () => {
      if (inputEl) {
         const density = analyzeKeywordDensity(inputEl.value, kwInputEl.value);
         if (kwCountEl) kwCountEl.textContent = density.count;
         if (kwPercentEl) kwPercentEl.textContent = `${density.percent}%`;
      }
      if (typeof window.saveToolInput === 'function') {
        window.saveToolInput(TOOL_ID + '-kw', kwInputEl.value);
      }
    });
  }

  if (limitInputEl) {
    limitInputEl.addEventListener('input', () => {
      if (inputEl) updateLimitWarning(inputEl.value.length);
      if (typeof window.saveToolInput === 'function') {
        window.saveToolInput(TOOL_ID + '-limit', limitInputEl.value);
      }
    });
  }

  if (btnClear) {
    btnClear.addEventListener('click', () => {
      if (inputEl) {
        inputEl.value = '';
        inputEl.focus();
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
        if (inputEl) {
          inputEl.value = text;
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
      if (inputEl) {
        inputEl.value = SAMPLE_TEXT;
        processText();
      }
    });
  }

  // Track usage occasionally when they paste or load sample
  [btnPaste, btnSample].forEach(btn => {
    if (btn) {
      btn.addEventListener('click', () => {
        if (typeof window.trackToolUse === 'function') window.trackToolUse(TOOL_ID);
      });
    }
  });

  // --- State Management ---
  function saveState() {
    if (typeof window.saveToolInput === 'function' && inputEl) {
      window.saveToolInput(TOOL_ID, inputEl.value);
    }
  }

  function loadState() {
    if (typeof window.loadToolInput === 'function') {
      const savedInput = window.loadToolInput(TOOL_ID);
      const savedKw = window.loadToolInput(TOOL_ID + '-kw');
      const savedLimit = window.loadToolInput(TOOL_ID + '-limit');

      if (savedInput && inputEl) inputEl.value = savedInput;
      if (savedKw && kwInputEl) kwInputEl.value = savedKw;
      if (savedLimit && limitInputEl) limitInputEl.value = savedLimit;

      return savedInput !== null;
    }
    return false;
  }

  // --- Initialization ---
  function init() {
    loadState();
    processText(); // Force initial calculation
  }

  init();

})();