# 🔧 DT NUC Companion

Application companion pour techniciens CND (Contrôle Non Destructif) travaillant sur les installations EDF.

## 🎯 Objectif

Fournir aux techniciens CND un outil fiable, rapide et sécurisé pour trouver, comprendre et exécuter les procédures DT NUC sur le terrain, même hors connexion, avec traçabilité et conformité.

## ✨ Fonctionnalités

### 📊 Tableau de bord
- Vue d'ensemble des missions en cours
- Suivi de progression des contrôles
- Alertes et notifications importantes
- Statistiques de conformité

### 📋 Procédures DT NUC
- Accès aux procédures par installation/équipement/méthode
- Recherche et filtrage avancés
- Gestion des versions et mises à jour
- Mode hors ligne intégral

### ✅ Check-list interactive
- Suivi pas-à-pas des procédures
- Validation d'étapes avec horodatage
- Capture de photos et mesures
- Sauvegarde automatique locale

### 📸 Photos & Mesures
- Capture et stockage d'images
- Enregistrement de mesures techniques
- Synchronisation différée
- Traçabilité complète

## 🚀 Test en local

### Option 1: Serveur Python (recommandé)
```bash
cd "/Users/hichamlaslaa/Desktop/amine projetct"
python3 -m http.server 8080
```

Puis ouvre: http://localhost:8080

### Option 2: Serveur Node.js
```bash
npm install
npm start
```

### Option 3: Double-clic
Double-clique simplement sur `index.html` (fonctionnalités limitées)

## 🌐 Version en ligne

Une fois déployé sur GitHub Pages, ton application sera accessible à :
`https://ton-username.github.io/dt-nuc-companion`

## 📱 PWA (Progressive Web App)

L'application peut être installée sur tablettes et smartphones :
- Icône sur l'écran d'accueil
- Fonctionnement hors ligne
- Interface native
- Notifications push (à venir)

## 🔧 Technologies

- **Frontend** : HTML5, CSS3, JavaScript ES6+
- **Stockage** : LocalStorage, IndexedDB (à implémenter)
- **PWA** : Service Worker, Web App Manifest
- **UI/UX** : Design optimisé pour usage avec gants/EPI

## 📋 Prochaines étapes

1. **Base de données locale** - IndexedDB pour stockage robuste
2. **Service Worker** - Cache intelligent et synchronisation
3. **Authentification** - Connexion sécurisée techniciens
4. **API Backend** - Synchronisation avec serveurs EDF
5. **Mode React Native** - Application mobile native
6. **Tests automatisés** - Couverture complète du code

## 🛡️ Sécurité

- Authentification multi-facteur (planifiée)
- Chiffrement des données sensibles
- Audit trails complets
- Conformité standards nucléaires

## 📚 Documentation

- `GUIDE-DEPLOIEMENT-GITHUB.md` - Guide complet de déploiement
- `CLAUDE.md` - Instructions pour l'assistant IA
- `instruction.rtf` - Spécifications fonctionnelles détaillées

## 🤝 Contribution

Projet en phase de développement initial. Contributions internes EDF uniquement.

## 📄 Licence

Usage interne EDF uniquement - Tous droits réservés

---

**🚀 Version de démonstration - Prêt pour tests et validation !**