/**
 * data-loader.js — Chargement dynamique des données JSON
 * Utilisé par les pages qui ont besoin de charger data/ en temps réel
 * (pour les futures mises à jour dynamiques)
 */

const DataLoader = {
  cache: {},

  async load(file) {
    if (this.cache[file]) return this.cache[file];
    try {
      const response = await fetch(`./data/${file}`);
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      this.cache[file] = data;
      return data;
    } catch (err) {
      console.warn(`[DataLoader] Impossible de charger ${file}:`, err.message);
      return null;
    }
  },

  async getSources() { return this.load('sources.json'); },
  async getEssais() { return this.load('essais.json'); },
  async getMolecules() { return this.load('molecules.json'); },
  async getChangelog() { return this.load('changelog.json'); },

  getEvidenceLabel(level) {
    const labels = {
      1: 'Méta-analyse / Revue systématique',
      2: 'Essai contrôlé randomisé (RCT)',
      3: 'Cohorte / Cas-témoin',
      4: 'Série / Rapport de cas',
      5: 'Étude animale in vivo',
      6: 'Étude cellulaire in vitro'
    };
    return labels[level] || 'Non classé';
  },

  getEvidenceColor(level) {
    const colors = {
      1: 'var(--color-success)',
      2: 'var(--color-teal)',
      3: 'var(--color-primary)',
      4: 'var(--color-warning)',
      5: 'var(--color-orange)',
      6: 'var(--color-danger)'
    };
    return colors[level] || 'var(--color-text-muted)';
  },

  getScoreClass(score) {
    if (score >= 60) return 'score-high';
    if (score >= 40) return 'score-mid';
    return 'score-low';
  }
};

// Expose globally
window.DataLoader = DataLoader;
