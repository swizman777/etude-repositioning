/**
 * tts.js — Module Text-to-Speech RepoOnco
 * Lecture vocale de chaque page via Web Speech API.
 *
 * Fonctionnalités :
 *   - Play / Pause / Stop
 *   - Vitesse ±10% (3 boutons : lent, normal, rapide)
 *   - Barre de progression
 *   - Skip section (suivant / précédent)
 *   - Persistance session (ne relit pas au refresh)
 *   - Bouton flottant discret (bas-droite)
 */

'use strict';

(function initTTS() {
  // Vérification support
  if (!('speechSynthesis' in window)) return;

  /* ── Configuration ── */
  const LANG = 'fr-FR';
  const DEFAULT_RATE = 0.95;
  const RATE_STEP = 0.1;
  const MIN_RATE = 0.6;
  const MAX_RATE = 1.6;
  const STORAGE_KEY = 'repoonco_tts_position';

  /* ── État ── */
  let sections = [];
  let currentSectionIndex = 0;
  let rate = DEFAULT_RATE;
  let isPlaying = false;
  let isPaused = false;
  let utterance = null;

  /* ── Collecte des sections lisibles ── */
  function collectSections() {
    const selectors = [
      '.mol-hero',
      '.mol-section',
      '.content-section',
      '.kpi-grid',
      '.card-grid',
      'main > .content-section',
    ];
    const main = document.querySelector('main, .main-content, #main');
    if (!main) return [];

    const allBlocks = main.querySelectorAll(
      'h1, h2, h3, p, li, dt, dd, .study-finding, .mechanism-card-text, .safety-card-content, .timeline-text, .alert-box, .kpi-label, .kpi-value, .kpi-sub, td, th'
    );

    const result = [];
    let currentGroup = { title: document.title || 'Page', text: '' };

    allBlocks.forEach((el) => {
      const tag = el.tagName.toLowerCase();
      const text = el.textContent.trim().replace(/\s+/g, ' ');
      if (!text || text.length < 3) return;

      if (tag === 'h1' || tag === 'h2') {
        if (currentGroup.text.length > 0) {
          result.push({ ...currentGroup });
        }
        currentGroup = { title: text, text: '' };
      } else {
        currentGroup.text += (currentGroup.text ? '. ' : '') + text;
      }
    });

    if (currentGroup.text.length > 0) {
      result.push({ ...currentGroup });
    }

    return result;
  }

  /* ── Synthèse vocale ── */
  function speakSection(index) {
    if (index < 0 || index >= sections.length) {
      stop();
      return;
    }

    window.speechSynthesis.cancel();
    currentSectionIndex = index;

    const sec = sections[index];
    const fullText = sec.title + '. ' + sec.text;

    utterance = new SpeechSynthesisUtterance(fullText);
    utterance.lang = LANG;
    utterance.rate = rate;
    utterance.pitch = 1.0;

    // Sélectionner une voix française si possible
    const voices = window.speechSynthesis.getVoices();
    const frVoice = voices.find(v => v.lang.startsWith('fr'));
    if (frVoice) utterance.voice = frVoice;

    utterance.onend = () => {
      if (isPlaying && !isPaused) {
        speakSection(currentSectionIndex + 1);
      }
    };

    utterance.onerror = () => {
      // Silently continue to next section on error
      if (isPlaying) speakSection(currentSectionIndex + 1);
    };

    window.speechSynthesis.speak(utterance);
    updateUI();
    savePosition();
  }

  function play() {
    if (sections.length === 0) sections = collectSections();
    if (sections.length === 0) return;

    isPlaying = true;
    isPaused = false;

    if (window.speechSynthesis.paused) {
      window.speechSynthesis.resume();
    } else {
      speakSection(currentSectionIndex);
    }
    updateUI();
  }

  function pause() {
    isPaused = true;
    window.speechSynthesis.pause();
    updateUI();
  }

  function stop() {
    isPlaying = false;
    isPaused = false;
    window.speechSynthesis.cancel();
    currentSectionIndex = 0;
    clearPosition();
    updateUI();
  }

  function skipNext() {
    if (currentSectionIndex < sections.length - 1) {
      speakSection(currentSectionIndex + 1);
    }
  }

  function skipPrev() {
    if (currentSectionIndex > 0) {
      speakSection(currentSectionIndex - 1);
    }
  }

  function changeRate(delta) {
    rate = Math.max(MIN_RATE, Math.min(MAX_RATE, rate + delta));
    rateDisplay.textContent = rate.toFixed(1) + '×';
    if (isPlaying && !isPaused) {
      // Restart current section with new rate
      speakSection(currentSectionIndex);
    }
  }

  /* ── Persistance session ── */
  function savePosition() {
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify({
        page: window.location.pathname,
        section: currentSectionIndex,
      }));
    } catch (e) { /* ignore */ }
  }

  function clearPosition() {
    try { sessionStorage.removeItem(STORAGE_KEY); } catch (e) { /* ignore */ }
  }

  function restorePosition() {
    try {
      const saved = JSON.parse(sessionStorage.getItem(STORAGE_KEY) || 'null');
      if (saved && saved.page === window.location.pathname) {
        currentSectionIndex = saved.section || 0;
      }
    } catch (e) { /* ignore */ }
  }

  /* ── UI ── */
  let panel, btnPlayPause, btnStop, btnPrev, btnNext, rateDisplay, progressBar, progressFill, sectionLabel;

  function createUI() {
    // Floating button
    const fab = document.createElement('button');
    fab.id = 'tts-fab';
    fab.setAttribute('aria-label', 'Lecture vocale');
    fab.setAttribute('title', 'Lecture vocale');
    fab.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>`;
    Object.assign(fab.style, {
      position: 'fixed', bottom: '24px', right: '24px', zIndex: '9999',
      width: '56px', height: '56px', borderRadius: '50%', border: 'none',
      background: 'rgba(17, 26, 46, 0.85)', backdropFilter: 'blur(12px)',
      color: '#94a3b8', cursor: 'pointer', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      boxShadow: '0 4px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(56,189,248,0.15)',
      transition: 'all 0.25s ease',
    });
    fab.addEventListener('mouseenter', () => { fab.style.color = '#38bdf8'; fab.style.boxShadow = '0 4px 24px rgba(0,0,0,0.5), 0 0 0 1px rgba(56,189,248,0.4)'; });
    fab.addEventListener('mouseleave', () => { if (!panel.classList.contains('open')) { fab.style.color = '#94a3b8'; fab.style.boxShadow = '0 4px 24px rgba(0,0,0,0.4), 0 0 0 1px rgba(56,189,248,0.15)'; } });
    fab.addEventListener('click', togglePanel);
    document.body.appendChild(fab);

    // Panel
    panel = document.createElement('div');
    panel.id = 'tts-panel';
    panel.innerHTML = `
      <div class="tts-header">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/></svg>
        <span>Lecture vocale</span>
        <button class="tts-close" aria-label="Fermer">&times;</button>
      </div>
      <div class="tts-section-label" id="tts-section-label">—</div>
      <div class="tts-progress"><div class="tts-progress-fill" id="tts-progress-fill"></div></div>
      <div class="tts-controls">
        <button class="tts-btn" id="tts-prev" aria-label="Section précédente" title="Section précédente">⏮</button>
        <button class="tts-btn tts-btn-main" id="tts-play" aria-label="Lecture" title="Lecture">▶</button>
        <button class="tts-btn" id="tts-stop" aria-label="Stop" title="Stop">⏹</button>
        <button class="tts-btn" id="tts-next" aria-label="Section suivante" title="Section suivante">⏭</button>
      </div>
      <div class="tts-rate">
        <button class="tts-rate-btn" id="tts-slower" aria-label="Plus lent">−</button>
        <span class="tts-rate-display" id="tts-rate-display">${DEFAULT_RATE.toFixed(1)}×</span>
        <button class="tts-rate-btn" id="tts-faster" aria-label="Plus rapide">+</button>
      </div>
    `;
    Object.assign(panel.style, {
      position: 'fixed', bottom: '92px', right: '24px', zIndex: '9998',
      width: '280px', background: 'rgba(12, 18, 33, 0.95)', backdropFilter: 'blur(16px)',
      border: '1px solid rgba(56,189,248,0.2)', borderRadius: '16px',
      padding: '16px', display: 'none', fontFamily: "'Inter', sans-serif",
      boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    });
    document.body.appendChild(panel);

    // Inject panel CSS
    const style = document.createElement('style');
    style.textContent = `
      #tts-panel .tts-header { display:flex; align-items:center; gap:8px; color:#e2e8f0; font-size:13px; font-weight:600; margin-bottom:12px; }
      #tts-panel .tts-header svg { color:#38bdf8; flex-shrink:0; }
      #tts-panel .tts-close { margin-left:auto; background:none; border:none; color:#475569; font-size:18px; cursor:pointer; padding:0 4px; line-height:1; }
      #tts-panel .tts-close:hover { color:#e2e8f0; }
      #tts-panel .tts-section-label { font-size:11px; color:#94a3b8; white-space:nowrap; overflow:hidden; text-overflow:ellipsis; margin-bottom:8px; font-family:'JetBrains Mono',monospace; }
      #tts-panel .tts-progress { height:4px; background:rgba(148,163,184,0.1); border-radius:2px; overflow:hidden; margin-bottom:14px; }
      #tts-panel .tts-progress-fill { height:100%; background:linear-gradient(90deg,#38bdf8,#2dd4bf); border-radius:2px; width:0; transition:width 0.3s; }
      #tts-panel .tts-controls { display:flex; align-items:center; justify-content:center; gap:8px; margin-bottom:12px; }
      #tts-panel .tts-btn { background:rgba(148,163,184,0.08); border:1px solid rgba(148,163,184,0.12); color:#94a3b8; width:36px; height:36px; border-radius:8px; cursor:pointer; font-size:14px; display:flex; align-items:center; justify-content:center; transition:all 0.15s; }
      #tts-panel .tts-btn:hover { color:#e2e8f0; background:rgba(56,189,248,0.1); border-color:rgba(56,189,248,0.3); }
      #tts-panel .tts-btn-main { width:44px; height:44px; background:rgba(56,189,248,0.15); border-color:rgba(56,189,248,0.3); color:#38bdf8; font-size:18px; }
      #tts-panel .tts-btn-main:hover { background:rgba(56,189,248,0.25); }
      #tts-panel .tts-rate { display:flex; align-items:center; justify-content:center; gap:12px; }
      #tts-panel .tts-rate-btn { background:none; border:1px solid rgba(148,163,184,0.15); color:#94a3b8; width:28px; height:28px; border-radius:6px; cursor:pointer; font-size:14px; font-weight:700; display:flex; align-items:center; justify-content:center; transition:all 0.15s; }
      #tts-panel .tts-rate-btn:hover { color:#e2e8f0; border-color:rgba(56,189,248,0.3); }
      #tts-panel .tts-rate-display { font-family:'JetBrains Mono',monospace; font-size:12px; color:#94a3b8; min-width:36px; text-align:center; }
      #tts-panel.playing .tts-btn-main { background:rgba(34,197,94,0.15); border-color:rgba(34,197,94,0.3); color:#22c55e; }
      @media (max-width:480px) {
        #tts-panel { width:calc(100vw - 48px); right:24px; }
        #tts-fab { width:48px; height:48px; bottom:16px; right:16px; }
      }
    `;
    document.head.appendChild(style);

    // Wire events
    btnPlayPause = panel.querySelector('#tts-play');
    btnStop = panel.querySelector('#tts-stop');
    btnPrev = panel.querySelector('#tts-prev');
    btnNext = panel.querySelector('#tts-next');
    rateDisplay = panel.querySelector('#tts-rate-display');
    progressFill = panel.querySelector('#tts-progress-fill');
    sectionLabel = panel.querySelector('#tts-section-label');

    btnPlayPause.addEventListener('click', () => {
      if (isPlaying && !isPaused) { pause(); }
      else { play(); }
    });
    btnStop.addEventListener('click', stop);
    btnPrev.addEventListener('click', skipPrev);
    btnNext.addEventListener('click', skipNext);
    panel.querySelector('#tts-slower').addEventListener('click', () => changeRate(-RATE_STEP));
    panel.querySelector('#tts-faster').addEventListener('click', () => changeRate(RATE_STEP));
    panel.querySelector('.tts-close').addEventListener('click', togglePanel);
  }

  function togglePanel() {
    const isOpen = panel.style.display !== 'none';
    panel.style.display = isOpen ? 'none' : 'block';
    panel.classList.toggle('open', !isOpen);
  }

  function updateUI() {
    if (!btnPlayPause) return;

    if (isPlaying && !isPaused) {
      btnPlayPause.textContent = '⏸';
      btnPlayPause.setAttribute('aria-label', 'Pause');
      panel.classList.add('playing');
    } else {
      btnPlayPause.textContent = '▶';
      btnPlayPause.setAttribute('aria-label', 'Lecture');
      panel.classList.remove('playing');
    }

    if (sections.length > 0) {
      const pct = ((currentSectionIndex + 1) / sections.length) * 100;
      progressFill.style.width = pct + '%';
      sectionLabel.textContent = `${currentSectionIndex + 1}/${sections.length} — ${sections[currentSectionIndex]?.title || ''}`;
    }
  }

  /* ── Init ── */
  function boot() {
    sections = collectSections();
    restorePosition();
    createUI();

    // Load voices (async on some browsers)
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = () => {};
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }

  // Cleanup on page unload
  window.addEventListener('beforeunload', () => {
    window.speechSynthesis.cancel();
  });
})();
