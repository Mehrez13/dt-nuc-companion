# 🚀 Guide Complet : Déployer DT NUC Companion sur GitHub (Niveau Débutant)

## Prérequis nécessaires

### 1. Créer un compte GitHub
- Va sur https://github.com
- Clique sur "Sign up"
- Remplis avec ton email, mot de passe et nom d'utilisateur
- Confirme ton email

### 2. Installer Git sur ton ordinateur
- Va sur https://git-scm.com/download/mac
- Télécharge et installe Git pour Mac
- Une fois installé, ouvre Terminal

## Étape 1 : Créer ton dépôt GitHub

### Créer le dépôt depuis GitHub
1. Va sur GitHub.com et connecte-toi
2. Clique sur le bouton vert "New" (en haut à gauche)
3. Nom du dépôt : `dt-nuc-companion`
4. Description : `Application companion pour techniciens CND - DT NUC`
5. Sélectionne "Public" 
6. Coche ✅ "Add a README file"
7. Clique sur "Create repository"

## Étape 2 : Préparer tes fichiers locaux

### Dans Terminal, va dans ton dossier projet :
```bash
cd "/Users/hichamlaslaa/Desktop/amine projetct"
```

### Initialiser Git dans ton dossier :
```bash
git init
```

### Configurer ton identité Git :
```bash
git config --global user.name "TonNom"
git config --global user.email "ton-email@exemple.com"
```

## Étape 3 : Connecter ton dossier local à GitHub

### Récupérer l'URL de ton dépôt :
1. Sur la page de ton dépôt GitHub
2. Clique sur le bouton vert "Code"
3. Copie l'URL qui ressemble à : `https://github.com/ton-username/dt-nuc-companion.git`

### Connecter ton dossier local :
```bash
git remote add origin https://github.com/ton-username/dt-nuc-companion.git
```

## Étape 4 : Envoyer tes fichiers sur GitHub

### Ajouter tous tes fichiers :
```bash
git add .
```

### Créer ton premier commit :
```bash
git commit -m "Initial commit - DT NUC Companion project setup"
```

### Envoyer sur GitHub :
```bash
git push -u origin main
```

## Étape 5 : Configurer GitHub Pages (pour version web testable)

### Activer GitHub Pages :
1. Va sur ton dépôt GitHub
2. Clique sur "Settings" (en haut)
3. Scroll vers le bas jusqu'à "Pages" (dans le menu de gauche)
4. Source : sélectionne "Deploy from a branch"
5. Branch : sélectionne "main"
6. Folder : sélectionne "/ (root)"
7. Clique sur "Save"

### Ton site sera disponible à :
`https://ton-username.github.io/dt-nuc-companion`

## Étape 6 : Automatiser avec GitHub Actions (Optionnel)

Si tu veux déployer automatiquement à chaque modification, je vais créer un fichier d'automatisation.

## Commandes pratiques pour la suite

### Quand tu modifies des fichiers :
```bash
# Voir ce qui a changé
git status

# Ajouter les changements
git add .

# Créer un commit avec un message
git commit -m "Description de tes modifications"

# Envoyer sur GitHub
git push
```

### En cas de problème :
```bash
# Voir l'historique
git log --oneline

# Annuler le dernier commit (si pas encore pushé)
git reset --soft HEAD~1

# Forcer l'envoi (attention, dangereux !)
git push --force
```

## Fichiers importants à créer

Je vais maintenant créer les fichiers essentiels pour ton projet :

1. **index.html** - Page d'accueil web
2. **package.json** - Configuration du projet
3. **README.md** - Documentation
4. **.gitignore** - Fichiers à ignorer
5. **style.css** - Styles de base

---

## 🆘 Aide rapide

### Si tu es bloqué :
1. Vérifie que tu es dans le bon dossier : `pwd`
2. Vérifie le statut : `git status`
3. Vérifie les connexions : `git remote -v`

### Messages d'erreur courants :
- **"fatal: not a git repository"** → Tu n'es pas dans le bon dossier, utilise `cd`
- **"Authentication failed"** → Vérifie ton nom d'utilisateur/mot de passe GitHub
- **"Permission denied"** → Vérifie que tu as les droits sur le dépôt

---

**✅ Une fois ces étapes terminées, tu auras :**
- Ton code sauvegardé sur GitHub
- Une version web testable accessible en ligne
- Un système de versioning automatique
- Une base solide pour développer ton SAAS

**⏭️ Prochaine étape :** Je vais maintenant créer les fichiers de base pour ta version testable !