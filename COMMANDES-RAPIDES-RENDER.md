# ⚡ Commandes Rapides pour Render

## 🚀 Déploiement initial (à faire une seule fois)

### 1. Aller dans ton dossier
```bash
cd "/Users/hichamlaslaa/Desktop/amine projetct"
```

### 2. Configurer Git
```bash
git init
git config --global user.name "TonNom"
git config --global user.email "ton-email@exemple.com"
```

### 3. Premier envoi sur GitHub
```bash
git remote add origin https://github.com/ton-username/dt-nuc-companion.git
git add .
git commit -m "Initial commit - ready for Render"
git branch -M main
git push -u origin main
```

## 🔄 Mises à jour (à chaque modification)

### Après avoir modifié tes fichiers :
```bash
git add .
git commit -m "Tes modifications ici"
git push
```

**C'est tout !** Render redéploie automatiquement.

## 🧪 Tests locaux

### Avant de déployer, teste en local :
```bash
npm start
```
Puis va sur `http://localhost:8080`

### Ou avec Python :
```bash
npm run start-local
```

## 📱 URLs importantes

- **Local** : http://localhost:8080
- **Production** : https://dt-nuc-companion.onrender.com
- **Dashboard Render** : https://dashboard.render.com
- **GitHub** : https://github.com/ton-username/dt-nuc-companion

## 🛠️ Commandes utiles

```bash
# Voir le statut Git
git status

# Voir l'historique des commits  
git log --oneline

# Voir les branches
git branch

# Annuler le dernier commit (si pas encore pushé)
git reset --soft HEAD~1
```

## 🆘 En cas de problème

### Si git push échoue :
```bash
git pull origin main
git push
```

### Si erreur d'authentification GitHub :
1. Va dans GitHub Settings → Developer settings → Personal access tokens
2. Crée un token avec permissions "repo"
3. Utilise le token comme mot de passe

### Si Render ne déploie pas :
1. Va sur dashboard.render.com
2. Clique sur ton service
3. "Manual Deploy" → "Deploy latest commit"

---

**💡 Tip** : Sauvegarde ce fichier, tu l'utiliseras souvent !