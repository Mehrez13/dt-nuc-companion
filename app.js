  // DT NUC Companion - Application JavaScript avec IndexedDB
  class DTNucApp {
      constructor() {
      this.currentSection = 'dashboard';
      this.offlineMode = true;
      this.dbManager = null;
      this.swManager = null; // NOUVEAU
      this.init();
      }
    
      async init() {
            // Initialiser IndexedDB
            this.dbManager = new DatabaseManager();
            const dbInitialized = await this.dbManager.init();
      
            if (dbInitialized) {
                this.showToast('💾 IndexedDB initialisé avec succès', 'success');
                await this.loadDataFromDB();
            }
      
            // Initialiser ProcedureManager - NOUVEAU
            this.procedureManager = new ProcedureManager(this.dbManager);
      
            // Initialiser Service Worker
            this.swManager = new ServiceWorkerManager(this);
      
            this.bindEvents();
            this.updateConnectionStatus();
            this.showToast('🚀 Application avec gestion procédures avancée', 'info');
        }



      async loadDataFromDB() {
          try {
              const procedures = await this.dbManager.getAllProcedures();
              const storageInfo = await this.dbManager.getStorageInfo();
              console.log(`📋 ${procedures.length} procédures chargées`, storageInfo);
              this.updateProceduresList(procedures);
          } catch (error) {
              console.error('❌ Erreur chargement données:', error);
          }
      }

      updateProceduresList(procedures) {
          console.log('📋 Procédures disponibles:', procedures);
          // Interface mise à jour avec vraies données IndexedDB
      }

      bindEvents() {
          // Navigation
          const navButtons = document.querySelectorAll('.nav-btn');
          navButtons.forEach(btn => {
              btn.addEventListener('click', (e) => {
                  this.switchSection(e.target.dataset.section);
              });
          });

          this.bindChecklistEvents();
          this.bindDemoButtons();
          this.bindSearchAndFilters();
          this.registerServiceWorker();
      }

      switchSection(sectionName) {
          document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
          document.querySelectorAll('.nav-btn').forEach(btn => btn.classList.remove('active'));

          const targetSection = document.getElementById(sectionName);
          const targetNavBtn = document.querySelector(`[data-section="${sectionName}"]`);

          if (targetSection) {
              targetSection.classList.add('active');
              this.currentSection = sectionName;
          }
          if (targetNavBtn) targetNavBtn.classList.add('active');

          this.showToast(`🔄 Navigation vers ${this.getSectionTitle(sectionName)}`, 'info');
      }

      getSectionTitle(sectionName) {
          const titles = {
              'dashboard': 'Tableau de bord', 'procedures': 'Procédures DT NUC',
              'checklist': 'Check-list', 'photos': 'Photos & Mesures'
          };
          return titles[sectionName] || sectionName;
      }

      bindSearchAndFilters() {
          const searchInput = document.querySelector('.search-input');
          if (searchInput) {
              searchInput.addEventListener('input', (e) => this.filterProcedures(e.target.value));
          }
      }

      async filterProcedures(searchTerm) {
          if (!this.dbManager) return;
          try {
              const procedures = await this.dbManager.getAllProcedures();
              const term = searchTerm.toLowerCase();
              let visibleCount = 0;

              document.querySelectorAll('.procedure-card').forEach((card, index) => {
                  if (procedures[index]) {
                      const matches = procedures[index].code.toLowerCase().includes(term) ||
                                    procedures[index].title.toLowerCase().includes(term);
                      card.style.display = matches ? 'block' : 'none';
                      if (matches) visibleCount++;
                  }
              });

              if (searchTerm) this.showToast(`🔍 ${visibleCount} procédure(s) trouvée(s)`, 'info');
          } catch (error) {
              console.error('❌ Erreur recherche:', error);
          }
      }

      bindChecklistEvents() {
          document.querySelectorAll('.checklist-item input[type="checkbox"]').forEach((checkbox, index) => {
              if (!checkbox.disabled) {
                  checkbox.addEventListener('change', (e) => this.handleChecklistItem(e.target, index));
              }
          });

          document.querySelectorAll('.item-actions .btn-small').forEach(btn => {
              btn.addEventListener('click', (e) => this.handleChecklistAction(e.target.textContent));
          });
      }

      async handleChecklistItem(checkbox, index) {
          const item = checkbox.closest('.checklist-item');

          if (checkbox.checked) {
              item.classList.add('completed');
              item.classList.remove('current');

              const now = new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'});
              const timestampEl = document.createElement('span');
              timestampEl.className = 'timestamp';
              timestampEl.textContent = `✅ ${now}`;
              item.querySelector('.item-content').appendChild(timestampEl);

              this.activateNextStep(index);
              this.showToast('✅ Étape validée avec succès', 'success');

              // Sauvegarder progression en IndexedDB
              if (this.dbManager) {
                  await this.dbManager.addToSyncQueue('checklist', 'update', index);
              }
          }

          this.updateChecklistProgress();
      }

      activateNextStep(currentIndex) {
          const allItems = document.querySelectorAll('.checklist-item');
          allItems.forEach(item => item.classList.remove('current'));

          for (let i = currentIndex + 1; i < allItems.length; i++) {
              const checkbox = allItems[i].querySelector('input[type="checkbox"]');
              if (!checkbox.checked && !checkbox.disabled) {
                  allItems[i].classList.add('current');
                  break;
              }
          }
      }

      updateChecklistProgress() {
          const totalItems = document.querySelectorAll('.checklist-item input[type="checkbox"]').length;
          const completedItems = document.querySelectorAll('.checklist-item input[type="checkbox"]:checked').length;
          const percentage = (completedItems / totalItems) * 100;

          const progressFill = document.querySelector('.mini-progress-fill');
          const progressText = document.querySelector('.checklist-progress span');
          const dashboardProgress = document.querySelector('.progress-fill');
          const dashboardText = document.querySelector('.progress-text');

          if (progressFill) progressFill.style.width = `${percentage}%`;
          if (progressText) progressText.textContent = `${completedItems}/${totalItems} étapes terminées`;
          if (dashboardProgress) dashboardProgress.style.width = `${percentage}%`;
          if (dashboardText) dashboardText.textContent = `${Math.round(percentage)}% terminé`;

          if (completedItems === totalItems) {
              this.showToast('🎉 Toutes les étapes sont terminées !', 'success');
          }
      }

      handleChecklistAction(actionText) {
          if (actionText.includes('Photo')) this.simulatePhotoCapture();
          else if (actionText.includes('Mesure')) this.simulateMeasurement();
      }

      async simulatePhotoCapture() {
          this.showToast('📸 Photo capturée - sauvegarde IndexedDB', 'success');

          if (this.dbManager) {
              try {
                  await this.dbManager.addMedia({
                      type: 'photo', checklistId: 1,
                      filename: `photo_${Date.now()}.jpg`,
                      description: 'Photo capturée depuis checklist'
                  });
                  console.log('📸 Photo sauvegardée en IndexedDB');
              } catch (error) {
                  console.error('❌ Erreur sauvegarde photo:', error);
              }
          }

          setTimeout(() => this.addMediaItem('photo'), 1000);
      }

      async simulateMeasurement() {
          const measurement = (Math.random() * 5 + 10).toFixed(1);
          this.showToast(`📏 Mesure enregistrée: ${measurement}mm`, 'success');

          if (this.dbManager) {
              try {
                  await this.dbManager.addMedia({
                      type: 'measurement', checklistId: 1,
                      value: measurement, unit: 'mm'
                  });
                  console.log('📊 Mesure sauvegardée en IndexedDB');
              } catch (error) {
                  console.error('❌ Erreur sauvegarde mesure:', error);
              }
          }

          setTimeout(() => this.addMediaItem('measurement', `${measurement}mm`), 1000);
      }

      addMediaItem(type, value = '') {
          const mediaGrid = document.querySelector('.media-grid');
          const timestamp = new Date().toLocaleTimeString('fr-FR', {hour: '2-digit', minute: '2-digit'});

          const mediaItem = document.createElement('div');
          mediaItem.className = 'media-item';
          mediaItem.style.animation = 'slideInUp 0.3s ease';
          mediaItem.innerHTML = `
              <div class="media-thumbnail">
                  <div class="placeholder-image">${type === 'photo' ? '📷' : '📊'}</div>
              </div>
              <div class="media-info">
                  <h4>${type === 'photo' ? 'Nouvelle photo' : 'Mesure UT'}</h4>
                  <p>${type === 'photo' ? 'Contexte intervention' : `Valeur: ${value}`}</p>
                  <span class="timestamp">${timestamp}</span>
              </div>
          `;

          mediaGrid.insertBefore(mediaItem, mediaGrid.firstChild);
          this.updateSyncCounter();
      }

      async updateSyncCounter() {
          if (this.dbManager) {
              try {
                  const pendingItems = await this.dbManager.getPendingSyncItems();
                  const syncStatus = document.querySelector('.sync-status span:last-child');
                  if (syncStatus) {
                      syncStatus.textContent = `${pendingItems.length} éléments en attente de synchronisation`;
                  }
              } catch (error) {
                  console.error('❌ Erreur compteur sync:', error);
              }
          }
      }

      bindDemoButtons() {
          // Boutons procédures
          document.querySelectorAll('.procedure-actions .btn-primary').forEach(btn => {
              if (btn.textContent === 'Ouvrir') {
                  btn.addEventListener('click', (e) => {
                      e.target.style.transform = 'scale(0.95)';
                      setTimeout(() => e.target.style.transform = 'scale(1)', 150);

                      this.showToast('📋 Ouverture de la procédure...', 'info');
                      setTimeout(() => this.switchSection('checklist'), 1500);
                  });
              }
          });

          // Autres boutons
          const syncButton = document.querySelector('.sync-info .btn-secondary');
          if (syncButton) {
              syncButton.addEventListener('click', async (e) => {
                  e.target.disabled = true;
                  e.target.textContent = 'Synchronisation...';
                  await this.simulateSync();
                  setTimeout(() => {
                      e.target.disabled = false;
                      e.target.textContent = 'Synchroniser maintenant';
                  }, 3000);
              });
          }

          const addMediaBtn = document.querySelector('.media-header .btn-primary');
          if (addMediaBtn) {
              addMediaBtn.addEventListener('click', () => this.simulatePhotoCapture());
          }
      }

      async simulateSync() {
          this.showToast('🔄 Synchronisation en cours...', 'info');
          setTimeout(() => {
              const syncStatus = document.querySelector('.sync-status span:last-child');
              const syncIcon = document.querySelector('.sync-icon');
              if (syncStatus) syncStatus.textContent = 'Tous les éléments sont synchronisés';
              if (syncIcon) syncIcon.textContent = '✅';
              this.showToast('✅ Synchronisation terminée', 'success');
          }, 3000);
      }

      updateConnectionStatus() {
          const statusDot = document.querySelector('.status-dot');
          const statusText = document.querySelector('.connection-status span:last-child');

          if (this.offlineMode) {
              statusDot.classList.add('offline');
              statusDot.classList.remove('online');
              statusText.textContent = 'Hors ligne';
          } else {
              statusDot.classList.add('online');
              statusDot.classList.remove('offline');
              statusText.textContent = 'En ligne';
          }

          setTimeout(() => {
              this.offlineMode = !this.offlineMode;
              this.updateConnectionStatus();
          }, 30000);
      }

      showToast(message, type = 'info') {
          const toastContainer = document.getElementById('toast-container');
          const toast = document.createElement('div');

          const icons = {'info': 'ℹ️', 'success': '✅', 'warning': '⚠️', 'error': '❌'};
          toast.className = `toast toast-${type}`;
          toast.innerHTML = `
              <span class="toast-icon">${icons[type]}</span>
              <span class="toast-message">${message}</span>
          `;

          toast.style.cssText = `
              display: flex; align-items: center; gap: 0.5rem;
              background: var(--surface); border: 1px solid var(--border);
              border-radius: 8px; padding: 1rem; margin-bottom: 0.5rem;
              box-shadow: var(--shadow-lg); animation: slideInRight 0.3s ease;
              max-width: 300px; font-size: 0.875rem; position: relative; z-index: 1000;
          `;

          toastContainer.appendChild(toast);

          setTimeout(() => {
              toast.style.animation = 'slideOutRight 0.3s ease';
              setTimeout(() => {
                  if (toastContainer.contains(toast)) toastContainer.removeChild(toast);
              }, 300);
          }, 4000);
      }

      registerServiceWorker() {
          if ('serviceWorker' in navigator) {
              navigator.serviceWorker.register('/sw.js')
                  .then(reg => console.log('✅ Service Worker enregistré:', reg))
                  .catch(err => console.log('❌ Erreur Service Worker:', err));
          }
      }
  }

  // Gestionnaire Service Worker
  class ServiceWorkerManager {
      constructor(app) {
          this.app = app;
          this.swRegistration = null;
          this.init();
      }

      async init() {
          if ('serviceWorker' in navigator) {
              try {
                  this.swRegistration = await navigator.serviceWorker.register('/sw.js');
                  console.log('✅ Service Worker enregistré:', this.swRegistration);

                  // Écouter les messages du Service Worker
                  navigator.serviceWorker.addEventListener('message', (event) => {
                      this.handleServiceWorkerMessage(event);
                  });

                  // Vérifier les mises à jour
                  this.checkForUpdates();

                  // Écouter les changements d'état
                  this.swRegistration.addEventListener('updatefound', () => {
                      this.handleUpdateFound();
                  });

              } catch (error) {
                  console.error('❌ Erreur Service Worker:', error);
              }
          }
      }

      handleServiceWorkerMessage(event) {
          const { type, action, data } = event.data;

          if (type === 'SYNC_REQUEST') {
              this.handleSyncRequest(action, data);
          }
      }

      async handleSyncRequest(action, data) {
          if (action === 'sync-pending-data') {
              await this.syncPendingData();
          } else if (action === 'sync-pending-media') {
              await this.syncPendingMedia();
          }
      }

      async syncPendingData() {
          try {
              const pendingItems = await this.app.dbManager.getPendingSyncItems();
              console.log(`🔄 Synchronisation de ${pendingItems.length} éléments`);

              for (const item of pendingItems) {
                  // Simuler la synchronisation
                  await new Promise(resolve => setTimeout(resolve, 1000));
                  await this.app.dbManager.markSyncItemCompleted(item.id);
              }

              this.app.showToast('🔄 Données synchronisées en arrière-plan', 'success');
          } catch (error) {
              console.error('❌ Erreur sync données:', error);
          }
      }

      async syncPendingMedia() {
          try {
              // Simuler la synchronisation des médias
              this.app.showToast('📸 Médias synchronisés en arrière-plan', 'success');
          } catch (error) {
              console.error('❌ Erreur sync médias:', error);
          }
      }

      checkForUpdates() {
          if (this.swRegistration) {
              this.swRegistration.update();
          }
      }

      handleUpdateFound() {
          const newWorker = this.swRegistration.installing;
          newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  this.app.showToast('🔄 Mise à jour disponible - Rechargez la page', 'info');
              }
          });
      }

      // Enregistrer une synchronisation en arrière-plan
      async registerBackgroundSync(tag) {
          if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
              try {
                  const registration = await navigator.serviceWorker.ready;
                  await registration.sync.register(tag);
                  console.log(`🔄 Background sync enregistré: ${tag}`);
              } catch (error) {
                  console.error('❌ Erreur background sync:', error);
              }
          }
      }

      // Communiquer avec le Service Worker
      postMessage(type, action, data) {
          if (navigator.serviceWorker.controller) {
              navigator.serviceWorker.controller.postMessage({
                  type, action, data
              });
          }
      }
  }






  // CSS animations
  const additionalStyles = `
  @keyframes slideInRight { from { opacity: 0; transform: translateX(100%); } to { opacity: 1; transform: translateX(0); } }
  @keyframes slideOutRight { from { opacity: 1; transform: translateX(0); } to { opacity: 0; transform: translateX(100%); } }
  @keyframes slideInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }

  .nav-btn, .btn-primary, .btn-secondary, .btn-warning, .btn-small {
      transition: all 0.2s ease; cursor: pointer;
  }
  .nav-btn:hover, .btn-primary:hover, .btn-secondary:hover, .btn-warning:hover, .btn-small:hover {
      transform: translateY(-2px); box-shadow: 0 4px 12px rgba(0,0,0,0.15);
  }

  #toast-container { position: fixed; top: 80px; right: 20px; z-index: 1000; max-width: 350px; }

  .checklist-item.current { background: linear-gradient(90deg, rgba(37, 99, 235, 0.1) 0%, transparent 100%); border-left: 4px solid #2563eb; }
  .checklist-item.completed { background: rgba(34, 197, 94, 0.05); border-left: 4px solid #22c55e; }

  @media (max-width: 768px) {
      #toast-container { right: 10px; left: 10px; max-width: none; }
  }
  `;

  const styleSheet = document.createElement('style');
  styleSheet.textContent = additionalStyles;
  document.head.appendChild(styleSheet);

  // Initialiser l'application
  document.addEventListener('DOMContentLoaded', () => {
      window.dtNucApp = new DTNucApp();
  });

  // Gestion événements tactiles et hors ligne
  document.addEventListener('touchstart', function() {}, { passive: true });
  document.addEventListener('gesturestart', function(e) { e.preventDefault(); });

  window.addEventListener('online', () => {
      if (window.dtNucApp) {
          window.dtNucApp.showToast('🌐 Connexion rétablie', 'success');
          window.dtNucApp.offlineMode = false;
          window.dtNucApp.updateConnectionStatus();
      }
  });

  window.addEventListener('offline', () => {
      if (window.dtNucApp) {
          window.dtNucApp.showToast('📴 Mode hors ligne activé', 'warning');
          window.dtNucApp.offlineMode = true;
          window.dtNucApp.updateConnectionStatus();
      }
  });
