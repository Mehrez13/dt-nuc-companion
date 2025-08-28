# 🧪 Instructions pour tester ta version locale

## 🎯 Comment tester ton application maintenant

### Étape 1: Ouvre Terminal
1. Appuie sur `Cmd + Espace`
2. Tape "Terminal" 
3. Appuie sur Entrée

### Étape 2: Va dans ton dossier
```bash
cd "/Users/hichamlaslaa/Desktop/amine projetct"
```

### Étape 3: Lance le serveur local
```bash
python3 -m http.server 8080
```

Tu verras ce message :
```
Serving HTTP on :: port 8080 (http://[::]:8080/) ...
```

### Étape 4: Ouvre ton navigateur
1. Ouvre Safari, Chrome ou Firefox
2. Va à l'adresse : `http://localhost:8080`
3. 🎉 Ton application s'affiche !

## 🔍 Ce que tu peux tester

### Navigation
- Clique sur les onglets : "Tableau de bord", "Procédures DT NUC", "Check-list", "Photos & Mesures"
- Tous les onglets sont fonctionnels

### Tableau de bord
- Vue d'ensemble avec progression 65%
- Alertes et notifications
- Statistiques temps réel

### Procédures DT NUC  
- Clique sur "Ouvrir" → te redirige vers la check-list
- Boutons "Télécharger" et "Mettre à jour" avec notifications
- Recherche et filtres (interface seulement pour l'instant)

### Check-list interactive
- ✅ Coche les cases des étapes 3, 4, 5
- Regarde la progression se mettre à jour automatiquement
- Clique sur "📸 Photo" et "📝 Mesure" → capture simulée
- Les timestamps s'ajoutent automatiquement

### Photos & Mesures
- Clique sur "➕ Ajouter" → simule l'ajout d'une photo  
- Clique sur "Synchroniser maintenant" → simule la sync
- Compteur d'éléments en attente

### Fonctionnalités automatiques
- Notifications toast en bas à droite
- Changement statut connexion (toutes les 30 sec)
- Animations fluides
- Design responsive (teste sur différentes tailles)

## 📱 Test sur tablette/téléphone

1. Trouve l'adresse IP de ton Mac :
   - Dans Terminal tape : `ifconfig | grep "inet "`
   - Cherche une ligne comme : `inet 192.168.1.X`

2. Sur ta tablette/téléphone :
   - Va à : `http://192.168.1.X:8080`
   - (Remplace X par ton vrai numéro)

3. Teste avec des gants si possible !

## ⚙️ Interface optimisée

- **Boutons larges** : 48px minimum pour gants
- **Contrastes élevés** : lisible en extérieur  
- **Navigation simple** : pas de menus complexes
- **Touch-friendly** : zones tactiles généreuses

## 🛑 Arrêter le serveur

Dans Terminal, appuie sur `Ctrl + C` pour arrêter le serveur.

## 🐛 Si ça ne marche pas

### Erreur "command not found: python3"
Essaie :
```bash
python -m http.server 8080
```

### Erreur "Address already in use"
Essaie un autre port :
```bash
python3 -m http.server 8081
```
Puis va à `http://localhost:8081`

### Page blanche
1. Vérifie que tu es dans le bon dossier : `pwd`
2. Liste les fichiers : `ls` (tu dois voir index.html)
3. Recharge la page avec `Cmd + R`

## ✅ Validation checklist

Avant de passer au déploiement GitHub, vérifie :

- [ ] Application se charge correctement
- [ ] Navigation entre sections fonctionne
- [ ] Check-list interactive (cocher/décocher)
- [ ] Boutons de simulation (photos, mesures)
- [ ] Notifications toast s'affichent
- [ ] Design responsive sur mobile
- [ ] Pas d'erreurs dans Console navigateur (F12 → Console)

## 🎊 Prochaine étape : GitHub !

Une fois que tout fonctionne bien en local, tu pourras suivre le guide `GUIDE-DEPLOIEMENT-GITHUB.md` pour mettre ton application en ligne !

---

**💡 Conseil** : Garde Terminal ouvert pendant tes tests, tu verras les requêtes s'afficher quand tu navigues dans l'application.