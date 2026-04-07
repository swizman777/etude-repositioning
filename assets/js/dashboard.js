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
