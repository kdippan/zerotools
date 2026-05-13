/**
 * ZeroTools - Lorem Ipsum Generator
 * File: js/tools/lorem-ipsum.js
 */

(function () {
  const TOOL_ID = 'lorem-ipsum';

  // --- DOM Elements ---
  const unitSelectEl = document.getElementById('unit-select');
  const qtyInputEl = document.getElementById('qty-input');
  
  const variantRadios = document.querySelectorAll('input[name="variant"]');
  
  const optStartLoremEl = document.getElementById('opt-startlorem');
  const optHtmlTagsEl = document.getElementById('opt-html');

  const btnGenerate = document.getElementById('btn-run'); // the main generate button
  const btnRegenerate = document.getElementById('btn-regenerate'); // action inside output
  const btnCopy = document.getElementById('btn-copy');
  const btnDownload = document.getElementById('btn-download');
  
  const outputEl = document.getElementById('output');
  const statusEl = document.getElementById('status');

  // --- Word Banks ---
  
  const BANKS = {
    classic: [
      "lorem", "ipsum", "dolor", "sit", "amet", "consectetur", "adipiscing", "elit", "sed", "do", "eiusmod", "tempor", "incididunt", "ut", "labore", "et", "dolore", "magna", "aliqua", "enim", "ad", "minim", "veniam", "quis", "nostrud", "exercitation", "ullamco", "laboris", "nisi", "aliquip", "ex", "ea", "commodo", "consequat", "duis", "aute", "irure", "in", "reprehenderit", "voluptate", "velit", "esse", "cillum", "fugiat", "nulla", "pariatur", "excepteur", "sint", "occaecat", "cupidatat", "non", "proident", "sunt", "culpa", "qui", "officia", "deserunt", "mollit", "anim", "id", "est", "laborum", "accusamus", "ullam", "corporis", "suscipit", "laboriosam", "nemo", "ipsam", "voluptatem", "quia", "voluptas", "aspernatur", "aut", "odit", "autem", "fugit", "consequuntur", "magni", "dolores", "eos", "ratione", "sequi", "nesciunt", "neque", "porro", "quisquam", "dolorem", "ipsum", "quia", "numquam", "eius", "modi", "tempora", "incidunt", "magnam", "aliquam", "quaerat", "adipisci", "velit", "sed", "quia", "non", "numquam"
    ],
    hipster: [
      "artisan", "kombucha", "vinyl", "fixie", "letterpress", "cold-brew", "kinfolk", "mustache", "sriracha", "shoreditch", "messenger", "bag", "pabst", "gastropub", "stumptown", "microdosing", "intelligentsia", "succulents", "flannel", "sustainable", "hella", "chia", "typewriter", "irony", "beard", "keffiyeh", "church-key", "authentic", "schlitz", "pour-over", "farm-to-table", "biodiesel", "raw", "denim", "selvage", "roof", "party", "craft", "beer", "gentrify", "single-origin", "coffee", "aesthetic", "bespoke", "thundercats", "VHS", "bushwick", "leggings", "yolo", "pug", "wayfarers", "tumblr", "distillery", "chambray", "locavore", "crucifix", "umami", "paleo", "polaroid", "trust", "fund", "tote", "asymmetrical", "keytar", "tacos", "banh", "mi", "retro", "marxism", "copper", "mug", "taxidermy", "cray", "ethical", "vegan", "edison", "bulb", "freegan"
    ],
    dev: [
      "deploy", "kubernetes", "agile", "sprint", "MVP", "git", "ci/cd", "docker", "microservice", "frontend", "backend", "fullstack", "node", "npm", "serverless", "lambda", "graphql", "rest", "api", "json", "async", "await", "promise", "callback", "framework", "component", "state", "props", "redux", "context", "hook", "refactor", "bug", "feature", "hotfix", "merge", "conflict", "rebase", "branch", "commit", "push", "pull", "origin", "master", "main", "repo", "issue", "ticket", "kanban", "scrum", "standup", "retro", "epic", "story", "point", "velocity", "burn-down", "pipeline", "build", "test", "coverage", "lint", "prettier", "typescript", "compiler", "runtime", "engine", "sandbox", "virtual", "machine", "cloud", "aws", "azure", "gcp", "bucket", "database", "sql", "nosql", "query", "index", "cache", "redis", "memcached", "message", "queue", "kafka", "rabbitmq"
    ],
    cupcake: [
      "cupcake", "ipsum", "dolor", "sit", "amet", "cake", "chocolate", "jelly", "beans", "macaroon", "marshmallow", "candy", "canes", "gummi", "bears", "caramels", "chupa", "chups", "tart", "cookie", "pie", "donut", "pastry", "wafer", "brownie", "gingerbread", "topping", "icing", "powder", "sugar", "plum", "halvah", "marzipan", "toffee", "sesame", "snaps", "lollipop", "cotton", "cheesecake", "fruitcake", "muffin", "croissant", "dessert", "sweet", "roll", "dragée", "biscuit", "pudding", "tiramisu", "soufflé", "ice", "cream", "sorbet", "gelato", "fudge", "brittle", "praline", "nougat", "truffle", "bonbon", "gummy", "worm", "bear", "jawbreaker", "gobstopper", "licorice", "taffy", "jujube", "sprinkles", "frosting", "glaze", "batter", "dough"
    ]
  };

  // --- Utility Logic ---

  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  function escapeHtml(unsafe) {
    return (unsafe || '').toString()
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function getRandomWord(bank) {
    // Math.random() is acceptable here as this is non-cryptographic placeholder text
    const index = Math.floor(Math.random() * bank.length);
    return bank[index];
  }

  function capitalize(word) {
    return word.charAt(0).toUpperCase() + word.slice(1);
  }

  // --- Generator Engine ---

  function generateSentence(bank, wordCount = null) {
    // A standard sentence usually has between 6 and 15 words
    const count = wordCount || Math.floor(Math.random() * 10) + 6;
    let sentence = [];
    
    for (let i = 0; i < count; i++) {
      let word = getRandomWord(bank);
      if (i === 0) {
        word = capitalize(word);
      }
      sentence.push(word);
    }
    
    return sentence.join(' ') + '.';
  }

  function generateParagraph(bank, sentenceCount = null) {
    // A standard paragraph usually has between 3 and 7 sentences
    const count = sentenceCount || Math.floor(Math.random() * 5) + 3;
    let paragraph = [];
    
    for (let i = 0; i < count; i++) {
      paragraph.push(generateSentence(bank));
    }
    
    return paragraph.join(' ');
  }

  function getOptions() {
    let variant = 'classic';
    if (variantRadios.length > 0) {
      variantRadios.forEach(r => { if (r.checked) variant = r.value; });
    }

    return {
      unit: unitSelectEl ? unitSelectEl.value : 'paragraphs',
      qty: parseInt(qtyInputEl ? qtyInputEl.value : 3, 10) || 1,
      variant: variant,
      startLorem: optStartLoremEl ? optStartLoremEl.checked : true,
      htmlTags: optHtmlTagsEl ? optHtmlTagsEl.checked : false
    };
  }

  function processGeneration() {
    if (!outputEl) return;

    const opts = getOptions();
    const bank = BANKS[opts.variant] || BANKS['classic'];
    
    // Safety caps to prevent browser locking
    if (opts.unit === 'words' && opts.qty > 5000) opts.qty = 5000;
    if (opts.unit === 'sentences' && opts.qty > 500) opts.qty = 500;
    if (opts.unit === 'paragraphs' && opts.qty > 100) opts.qty = 100;

    let resultItems = [];

    if (opts.unit === 'words') {
      let words = [];
      for (let i = 0; i < opts.qty; i++) {
        let w = getRandomWord(bank);
        // Standardize: if starting with lorem, handle first two words specifically if classic
        if (opts.startLorem && i === 0 && opts.variant === 'classic') w = 'Lorem';
        if (opts.startLorem && i === 1 && opts.variant === 'classic') w = 'ipsum';
        if (i === 0 && !opts.startLorem) w = capitalize(w);
        words.push(w);
      }
      let finalStr = words.join(' ');
      if (!finalStr.endsWith('.')) finalStr += '.';
      resultItems.push(finalStr);

    } else if (opts.unit === 'sentences') {
      for (let i = 0; i < opts.qty; i++) {
        let s = generateSentence(bank);
        if (i === 0 && opts.startLorem && opts.variant === 'classic') {
            s = "Lorem ipsum dolor sit amet, consectetur adipiscing elit.";
        }
        resultItems.push(s);
      }
      // Usually sentences are joined into a block unless user explicitly wants an array. 
      // We will join them with spaces to form a single text block.
      resultItems = [resultItems.join(' ')];

    } else if (opts.unit === 'paragraphs') {
      for (let i = 0; i < opts.qty; i++) {
        let p = generateParagraph(bank);
        if (i === 0 && opts.startLorem && opts.variant === 'classic') {
          // Splice standard lorem into the beginning of the first paragraph
          const base = "Lorem ipsum dolor sit amet, consectetur adipiscing elit. ";
          p = base + p;
        }
        resultItems.push(p);
      }
    }

    // Formatting Output
    let finalRawText = '';
    let displayHtml = '';

    if (opts.htmlTags) {
      const tag = opts.unit === 'words' || opts.unit === 'sentences' ? 'span' : 'p';
      finalRawText = resultItems.map(item => `<${tag}>${item}</${tag}>`).join('\n\n');
      
      // For display, we render the tags as visible text (like a code snippet), 
      // but also provide a clean copy payload.
      displayHtml = `<div style="font-family: var(--font-mono); font-size: var(--text-sm); color: var(--syntax-string); white-space: pre-wrap; word-break: break-word;">${escapeHtml(finalRawText)}</div>`;
    } else {
      finalRawText = resultItems.join('\n\n');
      displayHtml = `<div style="font-family: var(--font-sans); font-size: var(--text-base); color: var(--text-primary); line-height: 1.7; white-space: pre-wrap; word-break: break-word;">${escapeHtml(finalRawText)}</div>`;
    }

    outputEl.innerHTML = displayHtml;
    outputEl.dataset.raw = finalRawText;

    if (statusEl) {
      statusEl.innerHTML = `<span style="color: var(--color-success);">✓ Generated</span> <span style="color: var(--border-strong);">·</span> ${opts.qty} ${opts.unit}`;
    }

    saveState();
  }

  // --- Event Listeners ---

  // For inputs that should trigger regeneration immediately
  if (unitSelectEl) unitSelectEl.addEventListener('change', processGeneration);
  if (optStartLoremEl) optStartLoremEl.addEventListener('change', processGeneration);
  if (optHtmlTagsEl) optHtmlTagsEl.addEventListener('change', processGeneration);
  
  variantRadios.forEach(r => r.addEventListener('change', processGeneration));

  // Debounce the quantity input so holding the arrow keys doesn't crush the browser
  const debouncedProcess = debounce(processGeneration, 200);
  if (qtyInputEl) {
    qtyInputEl.addEventListener('input', debouncedProcess);
  }

  // Action buttons
  if (btnGenerate) {
    btnGenerate.addEventListener('click', () => {
      processGeneration();
      if (typeof window.trackToolUse === 'function') window.trackToolUse(TOOL_ID);
    });
  }

  if (btnRegenerate) {
    btnRegenerate.addEventListener('click', () => {
      processGeneration();
      if (typeof window.trackToolUse === 'function') window.trackToolUse(TOOL_ID + '-regen');
    });
  }

  if (btnCopy) {
    btnCopy.addEventListener('click', () => {
      const rawOutput = outputEl ? outputEl.dataset.raw : '';
      if (!rawOutput) return;
      
      if (typeof window.copyToClipboard === 'function') {
        window.copyToClipboard(rawOutput, btnCopy);
      } else {
        navigator.clipboard.writeText(rawOutput);
      }
      
      if (typeof window.trackCopy === 'function') window.trackCopy(TOOL_ID);
    });
  }

  if (btnDownload) {
    btnDownload.addEventListener('click', () => {
      const rawOutput = outputEl ? outputEl.dataset.raw : '';
      if (!rawOutput) return;
      
      const opts = getOptions();
      const ext = opts.htmlTags ? 'html' : 'txt';

      const blob = new Blob([rawOutput], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      
      a.href = url;
      a.download = `lorem-ipsum-${Date.now()}.${ext}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  }

  // --- State Management ---
  function saveState() {
    if (typeof window.saveToolInput !== 'function') return;
    const opts = getOptions();
    window.saveToolInput(TOOL_ID + '-options', JSON.stringify(opts));
  }

  function loadState() {
    if (typeof window.loadToolInput !== 'function') return false;
    
    const saved = window.loadToolInput(TOOL_ID + '-options');
    if (!saved) return false;

    try {
      const opts = JSON.parse(saved);
      if (unitSelectEl) unitSelectEl.value = opts.unit;
      if (qtyInputEl) qtyInputEl.value = opts.qty;
      if (optStartLoremEl) optStartLoremEl.checked = opts.startLorem;
      if (optHtmlTagsEl) optHtmlTagsEl.checked = opts.htmlTags;
      
      variantRadios.forEach(r => {
        if (r.value === opts.variant) r.checked = true;
      });

      return true;
    } catch (e) {
      return false;
    }
  }

  function init() {
    loadState();
    processGeneration(); // Generate initial text on load so screen isn't empty
  }

  init();

})();