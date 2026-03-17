# 🇫🇷 Bleu Blanc Quiz - Naturalisation

Une application web interactive conçue pour aider les candidats à la naturalisation française à préparer l'entretien d'assimilation et le test de connaissances civiques.

L'application est déployée sur GitHub Pages et accessible à l'adresse suivante :
[https://tar-gezed.github.io/BBQuiz/](https://tar-gezed.github.io/BBQuiz/)

## ✨ Fonctionnalités Principales

- **Simulateur d'Examen QCM** : 40 questions à choix multiples (QCM) tirées aléatoirement avec un compte à rebours de 45 minutes, reproduisant les conditions réelles de l'examen civique.
- **Correction et Évaluation Automatique** : Évaluation instantanée de votre score une fois le test terminé, avec détail de vos réponses, la correction attendue et les commentaires explicatifs.
- **Suivi des Performances** : Sauvegarde automatique de votre historique de scores directement dans votre navigateur (LocalStorage) pour suivre votre progression.
- **Riche en Médias** : Plus de 250 questions incluant des supports visuels (images explicatives) affichées lors de la phase de correction.
- **100% Hors-ligne / Sans Backend** : L'application embarque toutes ses données en statique, ce qui offre un chargement instantané sans dépendance à une API ou base de données externe.
- **Mode Sombre / Clair** : Thème adaptatif basé sur la configuration de votre système d'exploitation.

## 🏗️ Architecture et Technologies

### Application Frontend (Angular 21+)
L'interface utilisateur.
- **Standalone Components** : Architecture Angular moderne sans `ngModules`.
- **Signaux (Signals)** : Gestion d'état et de réactivité native Angular pour l'interface et le chronomètre.
- **Styles et Accessibilité** : CSS moderne pur, respectueux de l'accessibilité contraste clair/sombre, typographie et lissages (Police _Outfit_ de Google Fonts).

## 🚀 Installation & Développement

### Pré-requis
- Node.js (v18+)
- npm (v9+)

### Instructions de Lancement

1. Clonez ce répertoire et naviguez vers le dossier de l'application Angular :
   ```bash
   cd BBQuiz
   ```

2. Installez les dépendances du projet :
   ```bash
   npm install
   ```

3. Démarrez le serveur de développement Angular :
   ```bash
   npm start
   ```

L'application sera accessible sur `http://localhost:4200/`. L'application se rafraîchira automatiquement si vous modifiez des fichiers source.

## 🛠️ Scripts Disponibles

Dans le répertoire du projet, vous pouvez lancer les commandes suivantes :

- `npm start` : Lance l'application en mode développement.
- `npm run build` : Compile l'application pour la production. Les fichiers de build seront stockés dans le dossier `dist/BBQuiz/browser/`.
- `npm test` : Lance la batterie de tests unitaires via Karma (si configurés).

## 🗂️ Structure du Projet

```text
BBQuiz/
├── public/                 # Ressources publiques servies directement (images issues de l'excel)
│   └── data/               # Contient data.json (généré par le script Python)
├── src/
│   ├── app/                # Code de l'application
│   │   ├── pages/          # Vues principales de l'application (Home, Quiz, Results)
│   │   └── services/       # Logique métier et états globaux (QuestionsService, StatsService)
│   ├── main.ts             # Point d'entrée de l'application
│   └── styles.css          # Styles CSS globaux (variables, thème clair/sombre, layout de base)
└── angular.json            # Configuration du projet Angular
```

## 🤝 Contribution & Mise à Jour des Questions
Si vous souhaitez enrichir la base de questions :
1. Modifiez le fichier Excel original (non inclus dans ce dépôt).
2. Lancez le script Python à la racine du workspace `python extract_data.py`.
3. Assurez-vous que le script a bien copié le nouveau fichier `data.json` ainsi que toutes les `images` dans le répertoire `BBQuiz/public/`.
4. Re-compilez l'application Angular.

## 🙏 Remerciements / Crédits
Un immense merci à **[ChouquetteAuSucre sur Reddit](https://www.reddit.com/r/FranceDigeste/comments/1qegph0/jai_cr%C3%A9%C3%A9_un_excel_en_ligne_pour_r%C3%A9viser_lexamen/)** pour avoir réalisé un travail monstrueux de compilation, de mise en forme et de création de la base de données Excel originale riche et documentée sur laquelle ce projet s'appuie. Son impressionnant travail de collecte de questions, réponses et commentaires est au cœur de cette application de révision !

## 📄 Licence
Ce projet est développé à des fins d'entraînement et de consolidation de connaissances gratuites pour l'examen de la citoyenneté.
