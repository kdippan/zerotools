/**
 * ZeroTools - Meta Tag Generator
 * File: js/tools/meta-tag-generator.js
 */

(function () {
  const TOOL_ID = 'meta-tag-generator';

  // --- DOM Elements ---
  const formEl = document.getElementById('meta-form');
  
  // Inputs
  const inputTitle = document.getElementById('title');
  const inputDesc = document.getElementById('description');
  const inputKeywords = document.getElementById('keywords');
  const inputAuthor = document.getElementById('author');
  const inputUrl = document.getElementById('canonical-url');
  const inputOgImage = document.getElementById('og-image-url');
  const inputTwitter = document.getElementById('twitter-handle');
  const selectRobots = document.getElementById('robots-select');
  
  // Counters
  const countTitle = document.getElementById('count-title');
  const countDesc = document.getElementById('count-desc');

  // Previews
  const previewGoogleTitle = document.getElementById('preview-google-title');
  const previewGoogleUrl = document.getElementById('preview-google-url');
  const previewGoogleDesc = document.getElementById('preview-google-desc');
  
  const previewFbImage = document.getElementById('preview-fb-image');
  const previewFbDomain = document.getElementById('preview-fb-domain');
  const previewFbTitle = document.getElementById('preview-fb-title');
  const previewFbDesc = document.getElementById('preview-fb-desc');

  const previewTwImage = document.getElementById('preview-tw-image');
  const previewTwDomain = document.getElementById('preview-tw-domain');
  const previewTwTitle = document.getElementById('preview-tw-title');
  const previewTwDesc = document.getElementById('preview-tw-desc');

  // Output
  const outputEl = document.getElementById('meta-output');
  const btnCopy = document.getElementById('btn-copy');
  const btnClear = document.getElementById('btn-clear');
  const btnSample = document.getElementById('btn-sample');
  const statusEl = document.getElementById('status');

  // --- Constants ---
  const LIMITS = {
    title: { max: 60, warn: 50 },
    desc: { max: 160, warn: 145 }
  };

  const SAMPLE_DATA = {
    title: "ZeroTools — Free Privacy-First Developer Utilities",
    description: "25+ free developer tools including JSON formatter, Base64 encoder, UUID generator, and regex tester. 100% browser-based. No sign-up required.",
    keywords: "developer tools, json formatter, base64 encode, uuid generator, offline tools",
    author: "Dippan Bhusal",
    url: "https://zerotools.dev/",
    image: "https://zerotools.dev/assets/og-image.png",
    twitter: "@dippanbhusal",
    robots: "index, follow"
  };

  // --- Core Logic ---

  function debounce(func, wait) {
    let timeout;
    return function (...args) {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  function escapeHtml(unsafe) {
    if (!unsafe) return '';
    return unsafe.toString()
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function truncateText(text, limit) {
    if (!text) return '';
    if (text.length <= limit) return text;
    return text.substring(0, limit) + '...';
  }

  function extractDomain(url) {
    if (!url) return 'example.com';
    try {
      // Add protocol if missing just to parse domain
      const fullUrl = url.startsWith('http') ? url : `https://${url}`;
      const { hostname } = new URL(fullUrl);
      return hostname.replace(/^www\./, '');
    } catch (e) {
      return url.split('/')[0] || 'example.com';
    }
  }

  function updateCounters() {
    if (!inputTitle || !inputDesc || !countTitle || !countDesc) return;

    const tLen = inputTitle.value.length;
    const dLen = inputDesc.value.length;

    countTitle.textContent = `${tLen} / ${LIMITS.title.max}`;
    if (tLen > LIMITS.title.max) countTitle.style.color = 'var(--color-error)';
    else if (tLen >= LIMITS.title.warn) countTitle.style.color = 'var(--color-warning)';
    else countTitle.style.color = 'var(--text-tertiary)';

    countDesc.textContent = `${dLen} / ${LIMITS.desc.max}`;
    if (dLen > LIMITS.desc.max) countDesc.style.color = 'var(--color-error)';
    else if (dLen >= LIMITS.desc.warn) countDesc.style.color = 'var(--color-warning)';
    else countDesc.style.color = 'var(--text-tertiary)';
  }

  function updatePreviews(data) {
    const defaultTitle = 'Your Page Title';
    const defaultDesc = 'Your page description will appear here in search engine results and social media cards.';
    const domain = extractDomain(data.url);
    const displayUrl = data.url ? (data.url.startsWith('http') ? data.url : `https://${data.url}`) : 'https://example.com';

    // Google SERP
    if (previewGoogleTitle) previewGoogleTitle.textContent = data.title || defaultTitle;
    if (previewGoogleUrl) previewGoogleUrl.textContent = displayUrl;
    // Google truncates description around 155-160 chars
    if (previewGoogleDesc) previewGoogleDesc.textContent = truncateText(data.description || defaultDesc, 160);

    // Facebook / Open Graph
    if (previewFbImage) {
      if (data.image) {
        previewFbImage.style.backgroundImage = `url('${escapeHtml(data.image)}')`;
        previewFbImage.textContent = '';
      } else {
        previewFbImage.style.backgroundImage = 'none';
        previewFbImage.textContent = '1200 x 630';
      }
    }
    if (previewFbDomain) previewFbDomain.textContent = domain.toUpperCase();
    if (previewFbTitle) previewFbTitle.textContent = truncateText(data.title || defaultTitle, 60);
    if (previewFbDesc) previewFbDesc.textContent = truncateText(data.description || defaultDesc, 110);

    // Twitter Card
    if (previewTwImage) {
      if (data.image) {
        previewTwImage.style.backgroundImage = `url('${escapeHtml(data.image)}')`;
        previewTwImage.textContent = '';
      } else {
        previewTwImage.style.backgroundImage = 'none';
        previewTwImage.textContent = '1200 x 630';
      }
    }
    if (previewTwDomain) previewTwDomain.textContent = domain;
    if (previewTwTitle) previewTwTitle.textContent = truncateText(data.title || defaultTitle, 70);
    if (previewTwDesc) previewTwDesc.textContent = truncateText(data.description || defaultDesc, 200);
  }

  function generateCode(data) {
    let html = `<!-- Primary Meta Tags -->\n`;
    
    if (data.title) html += `<title>${escapeHtml(data.title)}</title>\n`;
    if (data.title) html += `<meta name="title" content="${escapeHtml(data.title)}">\n`;
    if (data.description) html += `<meta name="description" content="${escapeHtml(data.description)}">\n`;
    if (data.keywords) html += `<meta name="keywords" content="${escapeHtml(data.keywords)}">\n`;
    if (data.author) html += `<meta name="author" content="${escapeHtml(data.author)}">\n`;
    if (data.robots) html += `<meta name="robots" content="${escapeHtml(data.robots)}">\n`;
    if (data.url) html += `<link rel="canonical" href="${escapeHtml(data.url)}">\n`;

    html += `\n<!-- Open Graph / Facebook -->\n`;
    html += `<meta property="og:type" content="website">\n`;
    if (data.url) html += `<meta property="og:url" content="${escapeHtml(data.url)}">\n`;
    if (data.title) html += `<meta property="og:title" content="${escapeHtml(data.title)}">\n`;
    if (data.description) html += `<meta property="og:description" content="${escapeHtml(data.description)}">\n`;
    if (data.image) html += `<meta property="og:image" content="${escapeHtml(data.image)}">\n`;

    html += `\n<!-- Twitter -->\n`;
    html += `<meta property="twitter:card" content="summary_large_image">\n`;
    if (data.url) html += `<meta property="twitter:url" content="${escapeHtml(data.url)}">\n`;
    if (data.title) html += `<meta property="twitter:title" content="${escapeHtml(data.title)}">\n`;
    if (data.description) html += `<meta property="twitter:description" content="${escapeHtml(data.description)}">\n`;
    if (data.image) html += `<meta property="twitter:image" content="${escapeHtml(data.image)}">\n`;
    
    if (data.twitter) {
      let handle = data.twitter.startsWith('@') ? data.twitter : `@${data.twitter}`;
      html += `<meta name="twitter:creator" content="${escapeHtml(handle)}">\n`;
      html += `<meta name="twitter:site" content="${escapeHtml(handle)}">\n`;
    }

    if (outputEl) outputEl.value = html;

    if (statusEl) {
      const lines = html.trim().split('\n').length;
      statusEl.innerHTML = `<span style="color: var(--color-success);">✓ Generated</span> <span style="color: var(--border-strong);">·</span> ${lines} tags ready`;
    }
  }

  function processForm() {
    const data = {
      title: inputTitle ? inputTitle.value.trim() : '',
      description: inputDesc ? inputDesc.value.trim() : '',
      keywords: inputKeywords ? inputKeywords.value.trim() : '',
      author: inputAuthor ? inputAuthor.value.trim() : '',
      url: inputUrl ? inputUrl.value.trim() : '',
      image: inputOgImage ? inputOgImage.value.trim() : '',
      twitter: inputTwitter ? inputTwitter.value.trim() : '',
      robots: selectRobots ? selectRobots.value : 'index, follow'
    };

    updateCounters();
    updatePreviews(data);
    generateCode(data);
    saveState(data);
  }

  // --- Event Listeners ---

  const debouncedProcess = debounce(processForm, 300);

  // Bind all inputs
  [inputTitle, inputDesc, inputKeywords, inputAuthor, inputUrl, inputOgImage, inputTwitter, selectRobots].forEach(el => {
    if (el) {
      el.addEventListener('input', debouncedProcess);
      if (el.tagName === 'SELECT') {
         el.addEventListener('change', processForm);
      }
    }
  });

  if (btnClear) {
    btnClear.addEventListener('click', () => {
      [inputTitle, inputDesc, inputKeywords, inputAuthor, inputUrl, inputOgImage, inputTwitter].forEach(el => {
        if (el) el.value = '';
      });
      if (selectRobots) selectRobots.value = 'index, follow';
      
      processForm();
      if (inputTitle) inputTitle.focus();
      
      if (typeof window.saveToolInput === 'function') {
        window.saveToolInput(TOOL_ID, '');
      }
    });
  }

  if (btnSample) {
    btnSample.addEventListener('click', () => {
      if (inputTitle) inputTitle.value = SAMPLE_DATA.title;
      if (inputDesc) inputDesc.value = SAMPLE_DATA.description;
      if (inputKeywords) inputKeywords.value = SAMPLE_DATA.keywords;
      if (inputAuthor) inputAuthor.value = SAMPLE_DATA.author;
      if (inputUrl) inputUrl.value = SAMPLE_DATA.url;
      if (inputOgImage) inputOgImage.value = SAMPLE_DATA.image;
      if (inputTwitter) inputTwitter.value = SAMPLE_DATA.twitter;
      if (selectRobots) selectRobots.value = SAMPLE_DATA.robots;
      
      processForm();
      if (typeof window.trackToolUse === 'function') window.trackToolUse(TOOL_ID);
    });
  }

  if (btnCopy) {
    btnCopy.addEventListener('click', () => {
      if (outputEl && outputEl.value) {
        if (typeof window.copyToClipboard === 'function') {
          window.copyToClipboard(outputEl.value, btnCopy);
        } else {
          navigator.clipboard.writeText(outputEl.value);
        }
        if (typeof window.trackCopy === 'function') window.trackCopy(TOOL_ID);
      }
    });
  }

  // --- State Management ---
  function saveState(data) {
    if (typeof window.saveToolInput !== 'function') return;
    window.saveToolInput(TOOL_ID, JSON.stringify(data));
  }

  function loadState() {
    if (typeof window.loadToolInput !== 'function') return false;
    
    const savedStr = window.loadToolInput(TOOL_ID);
    if (!savedStr) return false;

    try {
      const data = JSON.parse(savedStr);
      if (Object.keys(data).length === 0) return false; // Ignore empty saves from clear

      if (inputTitle) inputTitle.value = data.title || '';
      if (inputDesc) inputDesc.value = data.description || '';
      if (inputKeywords) inputKeywords.value = data.keywords || '';
      if (inputAuthor) inputAuthor.value = data.author || '';
      if (inputUrl) inputUrl.value = data.url || '';
      if (inputOgImage) inputOgImage.value = data.image || '';
      if (inputTwitter) inputTwitter.value = data.twitter || '';
      if (selectRobots && data.robots) selectRobots.value = data.robots;
      
      return true;
    } catch (e) {
      return false;
    }
  }

  // --- Initialization ---
  function init() {
    if (!loadState()) {
      // If no state, we just render empty previews
      processForm();
    } else {
      processForm();
    }
  }

  init();

})();