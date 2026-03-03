// Sound system
const soundSystem = {
  enabled: localStorage.getItem('soundEnabled') === 'true',
  ctx: null,
  
  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
    }
  },
  
  play(type = 'tap') {
    if (!this.enabled) return;
    this.init();
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    
    if (type === 'tap') {
      osc.frequency.value = 800;
      gain.gain.setValueAtTime(0.15, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);
      osc.start(this.ctx.currentTime);
      osc.stop(this.ctx.currentTime + 0.05);
    } else if (type === 'modal') {
      osc.frequency.value = 1200;
      gain.gain.setValueAtTime(0.12, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.08);
      osc.start(this.ctx.currentTime);
      osc.stop(this.ctx.currentTime + 0.08);
    } else if (type === 'nav') {
      osc.frequency.value = 600;
      gain.gain.setValueAtTime(0.1, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.06);
      osc.start(this.ctx.currentTime);
      osc.stop(this.ctx.currentTime + 0.06);
    }
  },
  
  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem('soundEnabled', this.enabled);
    return this.enabled;
  }
};

// Dark mode
function initDarkMode() {
  const stored = localStorage.getItem('theme');
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = stored || (prefersDark ? 'dark' : 'light');
  
  document.documentElement.setAttribute('data-theme', theme);
  updateDarkModeButton(theme);
  
  document.getElementById('darkModeToggle')?.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme');
    const newTheme = current === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateDarkModeButton(newTheme);
    soundSystem.play('tap');
  });
}

function updateDarkModeButton(theme) {
  const btn = document.getElementById('darkModeToggle');
  if (btn) btn.textContent = theme === 'dark' ? '☀️' : '🌙';
}

// Favorites
const favorites = {
  get() {
    try {
      return JSON.parse(localStorage.getItem('favorites') || '[]');
    } catch {
      return [];
    }
  },
  
  toggle(id) {
    const favs = this.get();
    const idx = favs.indexOf(id);
    if (idx > -1) {
      favs.splice(idx, 1);
    } else {
      favs.push(id);
    }
    localStorage.setItem('favorites', JSON.stringify(favs));
    return favs.includes(id);
  },
  
  has(id) {
    return this.get().includes(id);
  }
};

async function load(){
  const res = await fetch('./assets/data.json', {cache:'no-store'});
  if(!res.ok) throw new Error('Failed to load data.json');
  return await res.json();
}

function el(tag, cls, html){
  const n = document.createElement(tag);
  if(cls) n.className = cls;
  if(html != null) n.innerHTML = html;
  return n;
}

function goToAlgo(algoId){
  soundSystem.play('nav');
  const url = new URL('./algorithm.html', location.href);
  url.searchParams.set('id', algoId);
  location.href = url.toString();
}

let allItems = [];

function renderMenu(items) {
  const container = document.getElementById('menuContent');
  container.innerHTML = '';
  
  if (items.length === 0) {
    container.innerHTML = '<p style="text-align:center;color:var(--muted);padding:40px 20px">No results found</p>';
    return;
  }
  
  items.forEach(({section, item}) => {
    const sectionEl = container.querySelector(`[data-section="${section.id}"]`);
    if (!sectionEl) {
      const title = el('div', 'menuTitle', section.title);
      title.setAttribute('data-section', section.id);
      container.appendChild(title);
    }
    
    const b = el('button','menuBtn');
    const isFav = favorites.has(item.id);
    
    b.innerHTML = `
      <div class="menuBtn__content">
        ${item.title}
        ${item.subtitle ? `<small>${item.subtitle}</small>` : ''}
      </div>
      <span class="menuBtn__star ${isFav ? 'active' : ''}" data-id="${item.id}">${isFav ? '⭐' : '☆'}</span>
      <span class="menuBtn__chevron">›</span>
    `;
    
    // Star click
    const star = b.querySelector('.menuBtn__star');
    star.addEventListener('click', (e) => {
      e.stopPropagation();
      const active = favorites.toggle(item.id);
      star.classList.toggle('active', active);
      star.textContent = active ? '⭐' : '☆';
      soundSystem.play('tap');
    });
    
    // Button click
    b.addEventListener('click', () => goToAlgo(item.id));
    
    container.appendChild(b);
  });
  
  // Add extra menu items
  if (items.length === allItems.length) {
    ['About', 'Update'].forEach(t => {
      const b = el('button','menuBtn');
      b.innerHTML = `<div class="menuBtn__content">${t}</div><span class="menuBtn__chevron">›</span>`;
      b.addEventListener('click', () => {
        soundSystem.play('tap');
        alert('Demo screen: ' + t);
      });
      container.appendChild(b);
    });
  }
}

function setupSearch(data) {
  const searchInput = document.getElementById('searchInput');
  
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    
    if (!query) {
      renderMenu(allItems);
      return;
    }
    
    const filtered = allItems.filter(({item}) => {
      return item.title.toLowerCase().includes(query) ||
             (item.subtitle && item.subtitle.toLowerCase().includes(query));
    });
    
    renderMenu(filtered);
  });
}

(async function main(){
  initDarkMode();
  
  const data = await load();
  document.getElementById('appTitle').textContent = data.appTitle || 'Guidelines Demo';

  // Build flat list for searching
  data.sections.forEach(sec => {
    sec.items.forEach(item => {
      allItems.push({section: sec, item});
    });
  });
  
  renderMenu(allItems);
  setupSearch(data);
  
  // Export sound system globally
  window.soundSystem = soundSystem;
  
  // Register service worker for PWA
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js')
      .then(reg => console.log('Service Worker registered'))
      .catch(err => console.log('Service Worker registration failed:', err));
  }
})();
