// Sound system (same as app.js)
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

// Dark mode sync
function initDarkMode() {
  const theme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', theme);
}

async function load(){
  const res = await fetch('./assets/data.json', {cache:'no-store'});
  if(!res.ok) throw new Error('Failed to load data.json');
  return await res.json();
}

function $(sel){return document.querySelector(sel);}

function el(tag, cls, html){
  const n = document.createElement(tag);
  if(cls) n.className = cls;
  if(html != null) n.innerHTML = html;
  return n;
}

function openModal(url, caption){
  soundSystem.play('modal');
  $('#modalImg').src = url;
  $('#modalCap').textContent = caption || '';
  $('#modal').classList.remove('hidden');
}

function closeModal(){
  $('#modal').classList.add('hidden');
  $('#modalImg').src = '';
  $('#modalCap').textContent = '';
}

function colorClass(c){
  return c || 'grey';
}

let currentHighlight = null;

function renderStep(step){
  if(step.type === 'pill'){
    return el('div','box box--pill', step.text);
  }
  if(step.type === 'header'){
    const box = el('div',`box box--header ${colorClass(step.color)}`, step.text);
    if(step.icon){
      const ico = el('div','iconCircle');
      ico.innerHTML = `<img src="./assets/icons/${step.icon}.svg" alt="icon"/>`;
      if(step.image?.url){
        ico.addEventListener('click', ()=> openModal(step.image.url, step.image.caption || ''));
      }
      box.appendChild(ico);
    }
    return box;
  }
  if(step.type === 'step'){
    const box = el('div',`box box--step ${colorClass(step.color)}`, step.text);
    box.setAttribute('data-step-id', step.id);
    if(step.icon){
      const ico = el('div','iconCircle');
      ico.innerHTML = `<img src="./assets/icons/${step.icon}.svg" alt="icon"/>`;
      if(step.image?.url){
        ico.addEventListener('click', ()=> openModal(step.image.url, step.image.caption || ''));
      }
      box.appendChild(ico);
    }
    return box;
  }
  if(step.type === 'branch'){
    const wrap = el('div','branch');
    step.options.forEach(opt=>{
      const b = el('button',`branchBtn ${opt.color||''}`, opt.label);
      b.addEventListener('click', ()=>{
        soundSystem.play('tap');
        
        // Clear previous highlight
        if(currentHighlight){
          currentHighlight.classList.remove('highlight');
        }
        
        // toggle subflow: clear and render branch target
        const target = window.__stepsById.get(opt.to);
        const sub = document.getElementById('subflow');
        sub.innerHTML = '';
        sub.appendChild(el('div','arrow'));
        if(target){
          const stepEl = renderStep(target);
          sub.appendChild(stepEl);
          
          // Highlight and scroll
          setTimeout(() => {
            stepEl.classList.add('highlight');
            currentHighlight = stepEl;
            stepEl.scrollIntoView({behavior:'smooth', block:'center'});
          }, 100);
        }
      });
      wrap.appendChild(b);
    });
    return wrap;
  }
  return el('div','box box--step grey', step.text || '');
}

function switchTab(tabId) {
  // Hide all tab contents
  document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
  
  // Show selected tab content
  document.getElementById(tabId)?.classList.add('active');
  
  // Update tab buttons
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.querySelector(`[data-tab="${tabId}"]`)?.classList.add('active');
  
  soundSystem.play('tap');
}

function renderDrugsTab(algo) {
  const container = $('#drugsContent');
  container.innerHTML = '';
  
  if (!algo.drugsCards || algo.drugsCards.length === 0) {
    container.innerHTML = '<div class="notes-content"><p>No drug information available for this algorithm.</p></div>';
    return;
  }
  
  algo.drugsCards.forEach(drug => {
    const card = el('div', 'drug-card');
    card.innerHTML = `
      <h3>${drug.name}</h3>
      <p><strong>Dose:</strong> ${drug.dose}</p>
      <p><strong>Route:</strong> ${drug.route}</p>
      ${drug.notes ? `<p>${drug.notes}</p>` : ''}
    `;
    container.appendChild(card);
  });
}

function renderNotesTab(algo) {
  const container = $('#notesContent');
  container.innerHTML = '';
  
  if (!algo.notesMarkdown) {
    container.innerHTML = '<p>No additional notes for this algorithm.</p>';
    return;
  }
  
  // Simple markdown-like rendering
  const lines = algo.notesMarkdown.split('\n');
  let html = '';
  
  lines.forEach(line => {
    if (line.startsWith('### ')) {
      html += `<h3>${line.slice(4)}</h3>`;
    } else if (line.startsWith('- ')) {
      if (!html.includes('<ul>') || html.endsWith('</ul>')) {
        html += '<ul>';
      }
      html += `<li>${line.slice(2)}</li>`;
    } else if (line.trim() === '') {
      if (html.endsWith('</li>')) {
        html += '</ul>';
      }
      html += '<br/>';
    } else {
      if (html.endsWith('</li>')) {
        html += '</ul>';
      }
      html += `<p>${line}</p>`;
    }
  });
  
  if (html.endsWith('</li>')) {
    html += '</ul>';
  }
  
  container.innerHTML = html;
}

(async function main(){
  initDarkMode();
  
  // Show loading skeleton
  const skeleton = $('#loadingSkeleton');
  skeleton.classList.remove('hidden');
  
  try {
    const data = await load();
    const id = new URLSearchParams(location.search).get('id') || 'als';
    const algo = data.algorithms[id];
    
    if(!algo){
      document.body.innerHTML = '<div class="notes-content"><p>Algorithm not found.</p></div>';
      return;
    }

    document.title = algo.title;
    $('#algoTitle').textContent = algo.title;

    // Render tabs
    const tabs = $('#tabs');
    tabs.innerHTML = '';
    
    const tabConfig = [
      {id: 'tabOverview', label: 'Overview'},
      {id: 'tabDrugs', label: 'Drugs'},
      {id: 'tabNotes', label: 'Notes'}
    ];
    
    tabConfig.forEach((t, i) => {
      const b = el('button', 'tab' + (i===0?' active':''), t.label);
      b.setAttribute('data-tab', t.id);
      b.addEventListener('click', () => switchTab(t.id));
      tabs.appendChild(b);
    });

    // Map steps
    window.__stepsById = new Map();
    (algo.steps||[]).forEach(s=> window.__stepsById.set(s.id, s));

    // Render overview flow
    const flow = $('#flow');
    flow.innerHTML = '';
    algo.steps.forEach((s, idx)=>{
      flow.appendChild(renderStep(s));
      if(idx < algo.steps.length-1){
        flow.appendChild(el('div','arrow'));
      }
    });

    // Subflow for branch result
    const sub = el('div','subflow');
    sub.id = 'subflow';
    flow.appendChild(sub);
    
    // Render drugs tab
    renderDrugsTab(algo);
    
    // Render notes tab
    renderNotesTab(algo);

    // Hide loading skeleton
    skeleton.classList.add('hidden');
    
  } catch(err) {
    console.error(err);
    skeleton.classList.add('hidden');
    document.body.innerHTML = '<div class="notes-content"><p>Error loading algorithm.</p></div>';
  }

  // back button
  $('#btnBack').addEventListener('click', ()=> {
    soundSystem.play('nav');
    history.length>1 ? history.back() : (location.href='./index.html');
  });

  // Action bar
  $('#actionBack').addEventListener('click', ()=> {
    soundSystem.play('nav');
    history.length>1 ? history.back() : (location.href='./index.html');
  });
  
  $('#actionHome').addEventListener('click', ()=> {
    soundSystem.play('nav');
    location.href='./index.html';
  });
  
  $('#actionSound').addEventListener('click', (e)=> {
    const enabled = soundSystem.toggle();
    e.target.textContent = enabled ? '🔊 Sound' : '🔇 Sound';
    soundSystem.play('tap');
  });
  
  // Update sound button text
  $('#actionSound').textContent = soundSystem.enabled ? '🔊 Sound' : '🔇 Sound';

  // modal
  $('#modalOverlay').addEventListener('click', closeModal);
  $('#modalClose').addEventListener('click', closeModal);
  window.addEventListener('keydown', (e)=>{ if(e.key==='Escape') closeModal(); });
})();
