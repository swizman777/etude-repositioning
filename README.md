# Étude Repositionnement — Base documentaire oncologie

## Objet

Base documentaire publique et évolutive sur le **repositionnement de molécules en cancérologie**, avec focus sur les antiparasitaires et molécules hors brevet étudiées pour leurs propriétés antitumorales.

## Molécules suivies

| Molécule | Classe | Niveau de preuve max |
|---|---|---|
| **Ivermectine** | Avermectine (antiparasitaire) | Revue systématique |
| **Fenbendazole** | Benzimidazole (vétérinaire) | Rapport de cas |
| **Mébendazole** | Benzimidazole (humain) | Essai contrôlé randomisé |
| **Metformine** | Biguanide (antidiabétique) | Essai contrôlé randomisé |
| **Disulfirame** | Dithiocarbamate (alcoolisme) | Essai contrôlé randomisé |
| **Propranolol** | Bêta-bloquant | Essai de phase II |
| **Chloroquine/HCQ** | Amino-4-quinoléine (antipaludéen) | Essai contrôlé randomisé |

## Structure du projet

```
etude-repositioning/
├── index.html              Page d'accueil + introduction
├── dashboard.html          Dashboard visuel (KPIs, graphiques)
├── methode.html            Méthodologie + biais + transparence
├── documentation.html      Bibliothèque documentaire
├── README.md               Ce fichier
├── assets/
│   ├── css/style.css       Feuille de style SOC/NOC
│   ├── js/dashboard.js     Logique graphiques Chart.js
│   └── js/data-loader.js   Chargement données JSON
├── data/
│   ├── sources.json        Base maître (40 études)
│   ├── essais.json         Essais cliniques humains
│   ├── molecules.json      Fiches molécules + scores
│   └── changelog.json      Journal des mises à jour
└── docs/                   Réservé pour futurs PDF
```

## Règles méthodologiques

1. **Tout affirmé = sourcé** avec lien PMC/PubMed
2. **Niveaux de preuve** : 1 (méta-analyse) → 6 (in vitro)
3. **Doses contextualisées** par espèce, indication, type d'étude
4. **Sections critiques** argumentées par sources institutionnelles
5. **Biais identifiés** et nommés explicitement

## Mise à jour

Pour ajouter une étude :
1. Ajouter l'entrée dans `data/sources.json`
2. Mettre à jour `data/molecules.json` si nécessaire
3. Ajouter une entrée dans `data/changelog.json`
4. Commit + push → le site se met à jour automatiquement

## Publication

Ce projet est conçu pour GitHub Pages. Activez Pages depuis les paramètres du dépôt (branche `main`, dossier racine `/`).

## Avertissement

Ce projet est **strictement documentaire**. Il ne constitue en aucun cas un avis médical. Les molécules présentées sont à des stades variés de recherche et ne doivent pas être utilisées en automédication. Consultez toujours un professionnel de santé.

## Licence

Contenu documentaire — Usage éducatif et informatif.

---
*Dernière mise à jour : 7 avril 2026*
*Projet construit avec assistance IA (Perplexity Computer) — voir page Méthodologie pour détails complets*
