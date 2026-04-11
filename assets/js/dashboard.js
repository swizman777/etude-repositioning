/**
 * dashboard.js — RepoOnco Dashboard
 * Tableau de bord scientifique : repositionnement médicamenteux en oncologie
 *
 * Contient :
 *   - Configuration globale Chart.js (thème sombre)
 *   - Données embarquées (molécules, études, scores)
 *   - Initialisation des 4 graphiques
 *   - Filtrage interactif des fiches molécules
 */

'use strict';

/* ============================================================
   1. DONNÉES EMBARQUÉES
   ============================================================ */

/** Molécules avec scores et métadonnées */
const MOLECULES_DATA = [
  {
    id: 'mebendazole',
    name: 'Mébendazole',
    score: 70,
    class: 'Benzimidazole humain',
    category: 'noyau',
    hasHumanTrial: true,
    evidenceLevel: 2,
    studies: 9,
    mechanisms: ['Microtubules', 'Hedgehog/SMO', 'VEGFR2', 'Pyroptose'],
  },
  {
    id: 'metformine',
    name: 'Metformine',
    score: 55,
    class: 'Biguanide',
    category: 'complementaires',
    hasHumanTrial: true,
    evidenceLevel: 2,
    studies: 4,
    mechanisms: ['AMPK', 'mTOR', 'Insuline'],
  },
  {
    id: 'propranolol',
    name: 'Propranolol',
    score: 50,
    class: 'Bêta-bloquant',
    category: 'complementaires',
    hasHumanTrial: true,
    evidenceLevel: 2,
    studies: 4,
    mechanisms: ['β-adrénergique', 'Angiogenèse', 'Stress chirurgical'],
  },
  {
    id: 'ivermectine',
    name: 'Ivermectine',
    score: 45,
    class: 'Avermectine',
    category: 'noyau',
    hasHumanTrial: false,
    evidenceLevel: 1,
    studies: 5,
    mechanisms: ['Wnt/β-cat', 'PAK1', 'EGFR/ERK', 'Autophagie'],
  },
  {
    id: 'chloroquine',
    name: 'Chloroquine/HCQ',
    score: 45,
    class: 'Amino-4-quinoléine',
    category: 'complementaires',
    hasHumanTrial: true,
    evidenceLevel: 2,
    studies: 4,
    mechanisms: ['Autophagie', 'Lysosome', 'pH tumoral'],
  },
  {
    id: 'disulfirame',
    name: 'Disulfirame',
    score: 40,
    class: 'Dithiocarbamate',
    category: 'complementaires',
    hasHumanTrial: true,
    evidenceLevel: 2,
    studies: 4,
    mechanisms: ['ALDH', 'NPL4', 'Protéasome', 'Ferroptose'],
  },
  {
    id: 'fenbendazole',
    name: 'Fenbendazole',
    score: 30,
    class: 'Benzimidazole vétérinaire',
    category: 'noyau',
    hasHumanTrial: false,
    evidenceLevel: 4,
    studies: 6,
    mechanisms: ['Microtubules', 'GLUT4', 'p53', 'Mdm2'],
  },
];

/** Répartition des 40 études par type */
const STUDY_TYPES_DATA = {
  labels: [
    'In vitro',
    'Revue / Méta-analyse',
    'In vivo animal',
    'Essai clinique',
    'Repositionnement général',
    'Cohorte',
    'Rapport de cas',
  ],
  counts: [12, 11, 6, 6, 4, 1, 1],
};

/** Données radar — molécules noyau (axes 0–10) */
const RADAR_DATA = {
  axes: [
    'Études publiées',
    'Niveau de preuve',
    'Essais humains',
    'Profil sécurité',
    'Score potentiel',
  ],
  molecules: [
    { name: 'Ivermectine',  values: [5, 4, 1, 7, 5] },
    { name: 'Fenbendazole', values: [6, 3, 0, 3, 3] },
    { name: 'Mébendazole',  values: [9, 9, 8, 8, 7] },
  ],
};

/** Études par année de publication (données approximatives) */
const YEARS_DATA = {
  years: [2018, 2019, 2020, 2021, 2022, 2023, 2024, 2025],
  byMolecule: [
    { name: 'Mébendazole',  counts: [1, 1, 1, 1, 2, 1, 1, 1] },
    { name: 'Ivermectine',  counts: [0, 1, 1, 1, 1, 0, 1, 0] },
    { name: 'Fenbendazole', counts: [0, 0, 1, 1, 1, 1, 1, 1] },
    { name: 'Metformine',   counts: [1, 0, 1, 0, 1, 0, 1, 0] },
    { name: 'Disulfirame',  counts: [0, 0, 0, 1, 0, 1, 1, 0] },
    { name: 'Propranolol',  counts: [0, 0, 1, 0, 1, 0, 1, 1] },
    { name: 'Chloroquine',  counts: [0, 1, 0, 1, 0, 1, 0, 1] },
  ],
};


/* ============================================================
   2. CHART.JS — DEFAULTS THÈME SOMBRE
   ============================================================ */

function applyDarkThemeDefaults() {
  Chart.defaults.color = '#94a3b8';
  Chart.defaults.borderColor = 'rgba(148, 163, 184, 0.1)';
  Chart.defaults.font.family = "'Inter', 'Helvetica Neue', sans-serif";
  Chart.defaults.font.size = 12;

  // Plugins globaux
  Chart.defaults.plugins.legend.labels.color = '#94a3b8';
  Chart.defaults.plugins.legend.labels.padding = 16;
  Chart.defaults.plugins.legend.labels.usePointStyle = true;
  Chart.defaults.plugins.legend.labels.pointStyleWidth = 10;

  Chart.defaults.plugins.tooltip.backgroundColor = '#111a2e';
  Chart.defaults.plugins.tooltip.borderColor = 'rgba(56, 189, 248, 0.25)';
  Chart.defaults.plugins.tooltip.borderWidth = 1;
  Chart.defaults.plugins.tooltip.titleColor = '#e2e8f0';
  Chart.defaults.plugins.tooltip.bodyColor = '#94a3b8';
  Chart.defaults.plugins.tooltip.padding = 12;
  Chart.defaults.plugins.tooltip.cornerRadius = 8;

  // Scales par défaut
  Chart.defaults.scale.grid.color = 'rgba(148, 163, 184, 0.08)';
  Chart.defaults.scale.ticks.color = '#94a3b8';
  Chart.defaults.scale.grid.drawBorder = false;
}


/* ============================================================
   3. PALETTE COULEURS DASHBOARD
   ============================================================ */

const PALETTE = {
  primary:  { solid: '#38bdf8', alpha: 'rgba(56, 189, 248, 0.7)',  glow: 'rgba(56, 189, 248, 0.15)' },
  teal:     { solid: '#2dd4bf', alpha: 'rgba(45, 212, 191, 0.7)',  glow: 'rgba(45, 212, 191, 0.1)'  },
  success:  { solid: '#22c55e', alpha: 'rgba(34, 197, 94, 0.7)',   glow: 'rgba(34, 197, 94, 0.1)'   },
  warning:  { solid: '#eab308', alpha: 'rgba(234, 179, 8, 0.7)',   glow: 'rgba(234, 179, 8, 0.1)'   },
  orange:   { solid: '#f97316', alpha: 'rgba(249, 115, 22, 0.7)',  glow: 'rgba(249, 115, 22, 0.1)'  },
  danger:   { solid: '#ef4444', alpha: 'rgba(239, 68, 68, 0.7)',   glow: 'rgba(239, 68, 68, 0.1)'   },
  purple:   { solid: '#a78bfa', alpha: 'rgba(167, 139, 250, 0.7)', glow: 'rgba(167, 139, 250, 0.1)' },
};

/** Couleur selon le score (>60 vert, 40-60 jaune, <40 orange/rouge) */
function scoreColor(score) {
  if (score >= 60) return PALETTE.success.alpha;
  if (score >= 40) return PALETTE.warning.alpha;
  return PALETTE.orange.alpha;
}

function scoreBorderColor(score) {
  if (score >= 60) return PALETTE.success.solid;
  if (score >= 40) return PALETTE.warning.solid;
  return PALETTE.orange.solid;
}


/* ============================================================
   4. GRAPHIQUE 1 — SCORES PAR MOLÉCULE (barres horizontales)
   ============================================================ */

function initScoresChart() {
  const canvas = document.getElementById('chart-scores');
  if (!canvas) return;

  const labels = MOLECULES_DATA.map(m => m.name);
  const scores = MOLECULES_DATA.map(m => m.score);
  const bgColors = scores.map(scoreColor);
  const borderColors = scores.map(scoreBorderColor);

  new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Score de potentiel (%)',
        data: scores,
        backgroundColor: bgColors,
        borderColor: borderColors,
        borderWidth: 1,
        borderRadius: 4,
        borderSkipped: false,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      indexAxis: 'y',
      animation: {
        duration: 800,
        easing: 'easeOutQuart',
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.parsed.x}%`,
          },
        },
      },
      scales: {
        x: {
          min: 0,
          max: 100,
          ticks: {
            callback: val => val + '%',
            stepSize: 20,
          },
          grid: {
            color: 'rgba(148, 163, 184, 0.08)',
          },
        },
        y: {
          ticks: {
            color: '#94a3b8',
            font: { size: 11 },
          },
          grid: { display: false },
        },
      },
    },
  });
}


/* ============================================================
   5. GRAPHIQUE 2 — TYPE D'ÉTUDE (donut)
   ============================================================ */

function initStudyTypesChart() {
  const canvas = document.getElementById('chart-types');
  if (!canvas) return;

  const palette = [
    PALETTE.primary.alpha,
    PALETTE.teal.alpha,
    PALETTE.success.alpha,
    PALETTE.warning.alpha,
    PALETTE.orange.alpha,
    PALETTE.danger.alpha,
    PALETTE.purple.alpha,
  ];
  const borderPalette = [
    PALETTE.primary.solid,
    PALETTE.teal.solid,
    PALETTE.success.solid,
    PALETTE.warning.solid,
    PALETTE.orange.solid,
    PALETTE.danger.solid,
    PALETTE.purple.solid,
  ];

  new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: STUDY_TYPES_DATA.labels,
      datasets: [{
        data: STUDY_TYPES_DATA.counts,
        backgroundColor: palette,
        borderColor: borderPalette,
        borderWidth: 1,
        hoverOffset: 8,
      }],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '60%',
      animation: {
        animateRotate: true,
        animateScale: false,
        duration: 800,
        easing: 'easeOutQuart',
      },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            font: { size: 10 },
            padding: 10,
          },
        },
        tooltip: {
          callbacks: {
            label: ctx => {
              const total = ctx.dataset.data.reduce((a, b) => a + b, 0);
              const pct = ((ctx.parsed / total) * 100).toFixed(1);
              return ` ${ctx.label} : ${ctx.parsed} (${pct}%)`;
            },
          },
        },
      },
    },
  });
}


/* ============================================================
   6. GRAPHIQUE 3 — RADAR COMPARATIF
   ============================================================ */

function initRadarChart() {
  const canvas = document.getElementById('chart-radar');
  if (!canvas) return;

  const colors = [
    { bg: 'rgba(56, 189, 248, 0.15)',  border: '#38bdf8'  },
    { bg: 'rgba(239, 68, 68, 0.15)',   border: '#ef4444'  },
    { bg: 'rgba(34, 197, 94, 0.15)',   border: '#22c55e'  },
  ];

  const datasets = RADAR_DATA.molecules.map((mol, i) => ({
    label: mol.name,
    data: mol.values,
    backgroundColor: colors[i].bg,
    borderColor: colors[i].border,
    borderWidth: 2,
    pointBackgroundColor: colors[i].border,
    pointBorderColor: colors[i].border,
    pointRadius: 4,
    pointHoverRadius: 6,
  }));

  new Chart(canvas, {
    type: 'radar',
    data: {
      labels: RADAR_DATA.axes,
      datasets,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 800,
        easing: 'easeOutQuart',
      },
      plugins: {
        legend: {
          position: 'bottom',
          labels: { font: { size: 11 } },
        },
        tooltip: {
          callbacks: {
            label: ctx => ` ${ctx.dataset.label} : ${ctx.parsed.r}/10`,
          },
        },
      },
      scales: {
        r: {
          min: 0,
          max: 10,
          ticks: {
            stepSize: 2,
            color: '#475569',
            font: { size: 10 },
            backdropColor: 'transparent',
          },
          grid: {
            color: 'rgba(148, 163, 184, 0.12)',
          },
          pointLabels: {
            color: '#94a3b8',
            font: { size: 11 },
          },
          angleLines: {
            color: 'rgba(148, 163, 184, 0.1)',
          },
        },
      },
    },
  });
}


/* ============================================================
   7. GRAPHIQUE 4 — ÉTUDES PAR ANNÉE (barres empilées)
   ============================================================ */

function initYearsChart() {
  const canvas = document.getElementById('chart-years');
  if (!canvas) return;

  const moleculePalette = [
    PALETTE.success.alpha,
    PALETTE.teal.alpha,
    PALETTE.primary.alpha,
    PALETTE.warning.alpha,
    PALETTE.orange.alpha,
    PALETTE.danger.alpha,
    PALETTE.purple.alpha,
  ];
  const moleculeBorder = [
    PALETTE.success.solid,
    PALETTE.teal.solid,
    PALETTE.primary.solid,
    PALETTE.warning.solid,
    PALETTE.orange.solid,
    PALETTE.danger.solid,
    PALETTE.purple.solid,
  ];

  const datasets = YEARS_DATA.byMolecule.map((mol, i) => ({
    label: mol.name,
    data: mol.counts,
    backgroundColor: moleculePalette[i],
    borderColor: moleculeBorder[i],
    borderWidth: 1,
    borderRadius: 2,
  }));

  new Chart(canvas, {
    type: 'bar',
    data: {
      labels: YEARS_DATA.years.map(String),
      datasets,
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: {
        duration: 800,
        easing: 'easeOutQuart',
      },
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            font: { size: 10 },
            padding: 10,
          },
        },
        tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
            title: items => `Année ${items[0].label}`,
            footer: items => {
              const total = items.reduce((s, i) => s + i.parsed.y, 0);
              return `Total : ${total} étude${total > 1 ? 's' : ''}`;
            },
          },
        },
      },
      scales: {
        x: {
          stacked: true,
          grid: { display: false },
          ticks: { color: '#94a3b8', font: { size: 11 } },
        },
        y: {
          stacked: true,
          beginAtZero: true,
          ticks: {
            stepSize: 1,
            color: '#94a3b8',
            precision: 0,
          },
          grid: { color: 'rgba(148, 163, 184, 0.08)' },
        },
      },
    },
  });
}


/* ============================================================
   8. FILTRAGE DES FICHES MOLÉCULES
   ============================================================ */

/**
 * Filtre les cartes molécules en fonction du critère sélectionné.
 * @param {string} filter — 'all' | 'noyau' | 'complementaires' | 'essai-humain'
 * @param {HTMLElement} btn — bouton cliqué (pour la classe active)
 */
function filterMolecules(filter, btn) {
  // Mettre à jour les boutons actifs
  const allBtns = document.querySelectorAll('.filter-btn');
  allBtns.forEach(b => b.classList.remove('active'));
  if (btn) btn.classList.add('active');

  const cards = document.querySelectorAll('#mol-cards-grid .mol-card');
  let visibleCount = 0;

  cards.forEach(card => {
    const category = card.dataset.category || '';
    const essaiHumain = card.dataset.essaiHumain === 'true';

    let show = false;
    switch (filter) {
      case 'all':
        show = true;
        break;
      case 'noyau':
        show = (category === 'noyau');
        break;
      case 'complementaires':
        show = (category === 'complementaires');
        break;
      case 'essai-humain':
        show = essaiHumain;
        break;
      default:
        show = true;
    }

    if (show) {
      card.style.display = '';
      card.style.animation = 'fadeInCard 0.25s ease forwards';
      visibleCount++;
    } else {
      card.style.display = 'none';
    }
  });

  // État vide
  const emptyState = document.getElementById('mol-empty-state');
  if (emptyState) {
    emptyState.style.display = (visibleCount === 0) ? 'block' : 'none';
  }
}

// Exposer la fonction globalement pour les onclick inline du HTML
window.filterMolecules = filterMolecules;


/* ============================================================
   9. SCORE BARS — ANIMATION AU SCROLL
   ============================================================ */

function animateScoreBars() {
  // Réinitialiser les largeurs à 0 pour l'animation d'entrée
  const bars = document.querySelectorAll('.score-bar');
  bars.forEach(bar => {
    const targetWidth = bar.style.width;
    bar.style.width = '0';

    // Intersection Observer pour animer au scroll
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          requestAnimationFrame(() => {
            bar.style.width = targetWidth;
          });
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    observer.observe(bar);
  });
}


/* ============================================================
   10. ANIMATION D'ENTRÉE DES KPI CARDS
   ============================================================ */

function injectAnimationStyles() {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeInCard {
      from { opacity: 0; transform: translateY(8px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    @keyframes kpiCountUp {
      from { opacity: 0; transform: translateY(12px); }
      to   { opacity: 1; transform: translateY(0); }
    }

    .kpi-card {
      animation: kpiCountUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) both;
    }

    .kpi-card:nth-child(1) { animation-delay: 0.05s; }
    .kpi-card:nth-child(2) { animation-delay: 0.10s; }
    .kpi-card:nth-child(3) { animation-delay: 0.15s; }
    .kpi-card:nth-child(4) { animation-delay: 0.20s; }
    .kpi-card:nth-child(5) { animation-delay: 0.25s; }

    .mol-card {
      animation: fadeInCard 0.35s cubic-bezier(0.16, 1, 0.3, 1) both;
    }

    @media (prefers-reduced-motion: reduce) {
      .kpi-card, .mol-card { animation: none !important; }
      .score-bar { transition: none !important; }
    }
  `;
  document.head.appendChild(style);
}


/* ============================================================
   11. INITIALISATION PRINCIPALE
   ============================================================ */

function init() {
  // 1. Styles d'animation
  injectAnimationStyles();

  // 2. Thème sombre global Chart.js
  applyDarkThemeDefaults();

  // 3. Graphiques
  initScoresChart();
  initStudyTypesChart();
  initRadarChart();
  initYearsChart();

  // 4. Animation des barres de score au scroll
  animateScoreBars();
}

// Lancement au chargement du DOM (fichier chargé avec defer)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}


/* ============================================================
   12. HEATMAP — Niveau de preuve × Molécule
   Rendu en tableau HTML pur dans #heatmap-container
   ============================================================ */

/** Données heatmap : molécules × niveaux de preuve
 *  Format : counts[molIndex][levelIndex]
 *  Levels 1→6 : Revue, RCT, Cohorte, Cas, In vivo, In vitro
 */
const HEATMAP_DATA = {
  molecules: ['Mébendazole', 'Metformine', 'Propranolol', 'Chloroquine/HCQ', 'Ivermectine', 'Disulfirame', 'Fenbendazole'],
  levels: ['Niveau 1\nRevue/Méta', 'Niveau 2\nRCT/Phase II', 'Niveau 3\nCohorte', 'Niveau 4\nCas clinique', 'Niveau 5\nIn vivo', 'Niveau 6\nIn vitro'],
  levelsShort: ['N1 Revue', 'N2 RCT', 'N3 Cohorte', 'N4 Cas', 'N5 In vivo', 'N6 In vitro'],
  // [mol][level] counts (0-based : mol 0 = Mébendazole, level 0 = N1)
  counts: [
    [3, 1, 0, 0, 4, 1],  // Mébendazole
    [3, 1, 0, 0, 0, 0],  // Metformine
    [1, 1, 1, 0, 0, 1],  // Propranolol
    [2, 2, 0, 0, 0, 0],  // Chloroquine/HCQ
    [2, 0, 0, 0, 0, 3],  // Ivermectine
    [2, 1, 0, 0, 0, 1],  // Disulfirame
    [1, 0, 0, 1, 1, 3],  // Fenbendazole
  ],
  // Couleur accent par molécule
  molColors: ['#22c55e', '#2dd4bf', '#38bdf8', '#a78bfa', '#eab308', '#f97316', '#ef4444'],
};

/**
 * Retourne une couleur RGBA de chaleur en fonction du compte (0–max).
 * 0 → neutre foncé ; max → bleu électrique (#38bdf8 à forte opacité)
 */
function heatColor(count, max) {
  if (count === 0) return 'rgba(255,255,255,0.03)';
  const ratio = count / max;
  // Interpolation : faible = teal, fort = primary bleu
  const r = Math.round(34  + ratio * (56  - 34));
  const g = Math.round(197 + ratio * (189 - 197));
  const b = Math.round(94  + ratio * (248 - 94));
  const a = 0.15 + ratio * 0.65;
  return `rgba(${r},${g},${b},${a})`;
}

function initHeatmap() {
  const container = document.getElementById('heatmap-container');
  if (!container) return;

  const D = HEATMAP_DATA;
  const allCounts = D.counts.flat();
  const maxCount = Math.max(...allCounts);

  // Légende niveaux de preuve
  const legendHtml = `
    <div style="display:flex; gap:var(--space-4); flex-wrap:wrap; margin-bottom:var(--space-4); font-size:var(--text-xs); color:var(--color-text-muted);">
      ${D.levelsShort.map((l, i) => `
        <span style="display:flex; align-items:center; gap:4px;">
          <span style="width:10px; height:10px; border-radius:2px; background:${heatColor(maxCount - i * 0.5, maxCount)}; display:inline-block; flex-shrink:0;"></span>
          ${l}
        </span>`).join('')}
    </div>`;

  // Construction du tableau
  let tableHtml = `
    <table style="width:100%; border-collapse:separate; border-spacing:3px; font-size:var(--text-xs);">
      <thead>
        <tr>
          <th style="text-align:left; color:var(--color-text-faint); font-weight:400; padding:4px 8px; min-width:130px; white-space:nowrap;">Molécule</th>
          ${D.levelsShort.map(l => `<th style="text-align:center; color:var(--color-text-faint); font-weight:400; padding:4px 6px; white-space:nowrap;">${l}</th>`).join('')}
          <th style="text-align:center; color:var(--color-text-faint); font-weight:400; padding:4px 6px;">Total</th>
        </tr>
      </thead>
      <tbody>`;

  D.molecules.forEach((mol, mi) => {
    const rowTotal = D.counts[mi].reduce((a, b) => a + b, 0);
    tableHtml += `<tr>
      <td style="color:${D.molColors[mi]}; padding:5px 8px; font-weight:500; white-space:nowrap;">${mol}</td>`;
    D.counts[mi].forEach(count => {
      const bg = heatColor(count, maxCount);
      const textColor = count > 0 ? '#e2e8f0' : 'var(--color-text-faint)';
      tableHtml += `<td style="text-align:center; background:${bg}; border-radius:4px; padding:6px; color:${textColor}; font-weight:${count > 0 ? '600' : '400'}; font-family:var(--font-mono);">${count > 0 ? count : '—'}</td>`;
    });
    tableHtml += `<td style="text-align:center; color:var(--color-text-muted); font-weight:600; padding:5px 6px; font-family:var(--font-mono);">${rowTotal}</td></tr>`;
  });

  tableHtml += `</tbody></table>`;

  // Ligne totaux
  const colTotals = D.levels.map((_, li) => D.counts.reduce((s, row) => s + row[li], 0));
  const grandTotal = colTotals.reduce((a, b) => a + b, 0);
  tableHtml = tableHtml.replace('</tbody></table>', `
    <tr style="border-top:1px solid var(--color-divider);">
      <td style="color:var(--color-text-faint); padding:5px 8px; font-weight:500;">Total</td>
      ${colTotals.map(t => `<td style="text-align:center; color:var(--color-text-muted); font-weight:600; padding:5px 6px; font-family:var(--font-mono);">${t}</td>`).join('')}
      <td style="text-align:center; color:var(--color-primary); font-weight:700; padding:5px 6px; font-family:var(--font-mono);">${grandTotal}</td>
    </tr>
  </tbody></table>`);

  container.innerHTML = legendHtml + tableHtml;
}


/* ============================================================
   13. TIMELINE — publications par molécule (Chart.js bubble)
   Rendu dans #chart-timeline canvas
   ============================================================ */

/**
 * Chaque point = 1 étude publiée.
 * x = année, y = index molécule (0-6), r = rayon encodant le niveau de preuve.
 * On "étale" légèrement les points sur l'axe Y pour éviter les chevauchements.
 */
const TIMELINE_STUDIES = [
  // [molIndex, year, evidenceLevel, label]
  // Mébendazole (0)
  [0, 2011, 5, 'Bai 2011 – GBM in vivo'], [0, 2015, 5, 'Larsen 2015 – Médulloblastome'],
  [0, 2019, 1, 'Guerini 2019 – Revue'], [0, 2021, 5, 'Elayapillai 2021 – Ovaire'],
  [0, 2021, 6, 'Florio 2021 – Criblage'], [0, 2022, 6, 'Ren 2022 – GBM pyroptose'],
  [0, 2022, 2, 'Hegazy 2022 – RCT colorectal'], [0, 2023, 1, 'Meco 2023 – Revue cerv.'],
  [0, 2024, 5, 'Rodrigues 2024 – TNB métast.'],
  // Metformine (1)
  [1, 2010, 1, 'Decensi 2010 – Méta-analyse'], [1, 2014, 1, 'Gandini 2014 – Méta-analyse'],
  [1, 2022, 2, 'Goodwin 2022 – MA.32 RCT'], [1, 2023, 1, 'Wu 2023 – Revue essais'],
  // Propranolol (2)
  [2, 2016, 3, 'Cardwell 2016 – Cohorte'], [2, 2017, 2, 'Shaashua 2017 – Phase II'],
  [2, 2018, 6, 'Brohée 2018 – In vitro'], [2, 2025, 1, "O'Logbon 2025 – Revue"],
  // Chloroquine/HCQ (3)
  [3, 2014, 1, 'Manic 2014 – Revue'], [3, 2017, 1, 'Verbaanderd 2017 – ReDO'],
  [3, 2019, 2, 'Karasic 2019 – Phase II pancr.'], [3, 2020, 2, 'Zeh 2020 – Phase II néoadj.'],
  // Ivermectine (4)
  [4, 2016, 6, 'Wang 2016 – PAK1 in vitro'], [4, 2018, 1, 'Juarez 2018 – Revue'],
  [4, 2019, 6, 'Jiang 2019 – EGFR résist.'], [4, 2021, 1, 'Tang 2021 – Revue compl.'],
  [4, 2022, 6, 'Lv 2022 – Prostate'],
  // Disulfirame (5)
  [5, 2020, 6, 'Li 2020 – DSF/Cu in vitro'], [5, 2023, 2, 'Werlenius 2023 – DIRECT RCT'],
  [5, 2023, 1, 'Zhang 2023 – Revue imm.'], [5, 2024, 1, 'Zeng 2024 – Revue'],
  // Fenbendazole (6)
  [6, 2013, 6, 'Duan 2013 – In vitro'], [6, 2018, 6, 'Dogra 2018 – Multi-voies'],
  [6, 2019, 6, 'Mrkvová 2019 – Mélanome'], [6, 2020, 1, 'Son 2020 – Revue benzimid.'],
  [6, 2021, 4, 'Yamaguchi 2021 – Hépatotox.'], [6, 2024, 5, 'Wang 2024 – Ovaire in vivo'],
];

function initTimelineChart() {
  const canvas = document.getElementById('chart-timeline');
  if (!canvas) return;

  const molLabels = ['Mébendazole', 'Metformine', 'Propranolol', 'CQ/HCQ', 'Ivermectine', 'Disulfirame', 'Fenbendazole'];
  const molColors = [
    PALETTE.success.solid, PALETTE.teal.solid, PALETTE.primary.solid,
    PALETTE.purple.solid, PALETTE.warning.solid, PALETTE.orange.solid, PALETTE.danger.solid,
  ];

  // Radius selon niveau de preuve (level 1=plus haut = plus grand)
  function levelToRadius(level) {
    return [10, 9, 7, 6, 5, 4][level - 1] || 4;
  }

  // Construire un dataset par molécule
  const datasets = molLabels.map((name, mi) => {
    // Jitter vertical pour éviter les chevauchements
    const studies = TIMELINE_STUDIES.filter(s => s[0] === mi);
    const jitterMap = {};
    studies.forEach(s => {
      const key = s[1]; // year
      jitterMap[key] = (jitterMap[key] || 0);
      jitterMap[key]++;
    });
    const jitterCount = {};

    const data = studies.map(([, year, lvl, lbl]) => {
      jitterCount[year] = (jitterCount[year] || 0);
      const offset = (jitterCount[year] - (jitterMap[year] - 1) / 2) * 0.12;
      jitterCount[year]++;
      return {
        x: year,
        y: mi + offset,
        r: levelToRadius(lvl),
        evidenceLevel: lvl,
        studyLabel: lbl,
      };
    });

    return {
      label: name,
      data,
      backgroundColor: molColors[mi].replace(')', ', 0.75)').replace('rgb', 'rgba').replace('#', 'rgba(').replace(/^rgba\(([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2}),/, (_, r, g, b) => `rgba(${parseInt(r,16)},${parseInt(g,16)},${parseInt(b,16)},`),
      borderColor: molColors[mi],
      borderWidth: 1.5,
    };
  });

  // Correction : backgroundColor via hex → rgba converti proprement
  datasets.forEach((ds, mi) => {
    const hex = molColors[mi];
    const r = parseInt(hex.slice(1,3),16), g = parseInt(hex.slice(3,5),16), b = parseInt(hex.slice(5,7),16);
    ds.backgroundColor = `rgba(${r},${g},${b},0.75)`;
    ds.borderColor = hex;
  });

  new Chart(canvas, {
    type: 'bubble',
    data: { datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 900, easing: 'easeOutQuart' },
      plugins: {
        legend: {
          position: 'bottom',
          labels: { font: { size: 10 }, padding: 10 },
        },
        tooltip: {
          callbacks: {
            label: ctx => {
              const d = ctx.raw;
              return ` ${d.studyLabel} (N${d.evidenceLevel}) — ${d.x}`;
            },
          },
        },
      },
      scales: {
        x: {
          min: 2009,
          max: 2026,
          ticks: {
            stepSize: 2,
            color: '#94a3b8',
            font: { size: 11 },
            callback: val => String(val),
          },
          grid: { color: 'rgba(148,163,184,0.08)' },
          title: {
            display: true,
            text: 'Année de publication',
            color: '#475569',
            font: { size: 11 },
          },
        },
        y: {
          min: -0.6,
          max: 6.6,
          ticks: {
            stepSize: 1,
            color: '#94a3b8',
            font: { size: 10 },
            callback: val => {
              const idx = Math.round(val);
              return molLabels[idx] || '';
            },
          },
          grid: { color: 'rgba(148,163,184,0.06)' },
        },
      },
    },
  });
}


/* ============================================================
   14. MISE À JOUR INIT — intégration heatmap + timeline
   Remplacement de l'init() original pour ajouter les 2 nouvelles
   fonctions sans double-initialisation des graphiques existants.
   ============================================================ */

// On écrase le listener DOMContentLoaded original (chargé avec defer,
// donc exécuté après DOMContentLoaded — init() a déjà été appelé)
// en réouvrant l'init pour ajouter les 2 nouvelles fonctions.

// Puisque le script est chargé avec defer, init() a déjà été appelé
// via le bloc conditionnel en bas du fichier original.
// On se contente de patcher : après le prochain tick micro-task,
// les 2 nouvelles fonctions sont appelées si pas encore fait.

(function patchInitWithNewCharts() {
  // initHeatmap et initTimelineChart n'ont pas encore été appelés
  // (elles sont définies plus haut dans ce même fichier).
  // On les appelle une seule fois maintenant.
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initHeatmap();
      initTimelineChart();
    }, { once: true });
  } else {
    // DOM déjà prêt (script defer = après DOMContentLoaded)
    initHeatmap();
    initTimelineChart();
  }
}());
