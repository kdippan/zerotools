window.copyToClipboard = async function(text, buttonEl) {
  try {
    await navigator.clipboard.writeText(text);
    const originalText = buttonEl.textContent;
    buttonEl.textContent = 'Copied!';
    buttonEl.classList.add('copied');
    setTimeout(() => {
      buttonEl.textContent = originalText;
      buttonEl.classList.remove('copied');
    }, 2000);
  } catch (err) {
    window.showToast('Copy failed. Check permissions.', 'error');
  }
};

window.showToast = function(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
};

window.trackToolUse = function(toolName) {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'tool_used', { event_category: 'tool', event_label: toolName });
  }
};

window.trackCopy = function(toolName) {
  if (typeof gtag !== 'undefined') {
    gtag('event', 'copy_result', { event_category: 'engagement', event_label: toolName });
  }
};

window.saveToolInput = function(toolId, value) {
  localStorage.setItem(`zt-input-${toolId}`, value);
};

window.loadToolInput = function(toolId) {
  return localStorage.getItem(`zt-input-${toolId}`) || '';
};

document.addEventListener('DOMContentLoaded', () => {
  const html = document.documentElement;
  const themeToggle = document.getElementById('theme-toggle');
  const searchInput = document.getElementById('global-search');
  const searchDropdown = document.getElementById('search-results');
  const toolGrid = document.querySelector('.tool-grid');
  const categoryTabs = document.querySelectorAll('.tab-btn');

  const savedTheme = localStorage.getItem('zerotools-theme') || 'dark';
  html.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const currentTheme = html.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      html.setAttribute('data-theme', newTheme);
      localStorage.setItem('zerotools-theme', newTheme);
      updateThemeIcon(newTheme);
    });
  }

  function updateThemeIcon(theme) {
    if (!themeToggle) return;
    themeToggle.innerHTML = theme === 'dark'
      ? '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>'
      : '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>';
  }

  if (searchInput && searchDropdown) {
    let activeIndex = -1;

    document.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInput.focus();
      }
      if (e.key === 'Escape') {
        searchInput.blur();
        searchDropdown.hidden = true;
        activeIndex = -1;
      }
    });

    searchInput.addEventListener('input', (e) => {
      const query = e.target.value;
      activeIndex = -1;
      if (!query) {
        searchDropdown.hidden = true;
        return;
      }
      const results = typeof searchTools === 'function' ? searchTools(query) : [];
      renderSearchResults(results);
    });

    searchInput.addEventListener('keydown', (e) => {
      if (searchDropdown.hidden) return;
      const items = searchDropdown.querySelectorAll('a');
      if (!items.length) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        activeIndex = (activeIndex + 1) % items.length;
        updateSearchSelection(items);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        activeIndex = (activeIndex - 1 + items.length) % items.length;
        updateSearchSelection(items);
      } else if (e.key === 'Enter' && activeIndex >= 0) {
        e.preventDefault();
        items[activeIndex].click();
      }
    });

    function updateSearchSelection(items) {
      items.forEach((item, idx) => {
        item.style.background = idx === activeIndex ? 'var(--bg-elevated)' : 'transparent';
        item.style.borderColor = idx === activeIndex ? 'var(--accent-border)' : 'var(--border-subtle)';
      });
    }

    document.addEventListener('click', (e) => {
      if (!searchInput.contains(e.target) && !searchDropdown.contains(e.target)) {
        searchDropdown.hidden = true;
      }
    });
  }

  function renderSearchResults(results) {
    if (!results.length) {
      searchDropdown.innerHTML = '<div style="padding:16px;color:var(--text-secondary);font-size:var(--text-sm);text-align:center;">No tools found.</div>';
      searchDropdown.hidden = false;
      return;
    }
    searchDropdown.innerHTML = results.slice(0, 6).map(tool => `
      <a href="${tool.url}" style="display:flex;align-items:center;gap:12px;padding:12px 16px;text-decoration:none;border-bottom:1px solid var(--border-subtle);transition:all 0.15s;">
        <span style="font-family:var(--font-mono);font-size:20px;color:var(--text-primary);width:24px;text-align:center;">${tool.icon}</span>
        <div style="flex:1;min-width:0;">
          <div style="color:var(--text-primary);font-size:var(--text-sm);font-weight:500;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${tool.name}</div>
          <div style="color:var(--text-tertiary);font-size:var(--text-xs);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${tool.desc}</div>
        </div>
        <span class="badge badge-${tool.category}">${tool.badge}</span>
      </a>
    `).join('');
    searchDropdown.hidden = false;
  }

  function renderHomepageGrid(toolsToRender) {
    if (!toolGrid) return;
    toolGrid.innerHTML = toolsToRender.map(tool => `
      <a href="${tool.url}" class="tool-card">
        <div class="tool-icon">${tool.icon}</div>
        <div class="tool-name">
          ${tool.name} 
          ${tool.popular ? '<span style="color:var(--color-warning);font-size:12px;margin-left:4px;" title="Popular">★</span>' : ''}
        </div>
        <div class="tool-desc">${tool.desc}</div>
        <div class="tool-tag">${tool.badge}</div>
      </a>
    `).join('');
  }

  if (toolGrid && typeof TOOLS !== 'undefined') {
    renderHomepageGrid(TOOLS);
    if (categoryTabs) {
      categoryTabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
          categoryTabs.forEach(t => t.classList.remove('active'));
          e.target.classList.add('active');
          const category = e.target.textContent.toLowerCase().trim();
          const filtered = category === 'all' ? TOOLS : filterByCategory(category);
          renderHomepageGrid(filtered);
        });
      });
    }
  }
});