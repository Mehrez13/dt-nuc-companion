// DT NUC Companion - Application JavaScript
class DTNucApp {
    constructor() {
        this.currentSection = 'dashboard';
        this.offlineMode = true;
        this.checklistData = {};
        this.init();
    }

    init() {
        this.bindEvents();
        this.updateConnectionStatus();
        this.loadChecklistData();
        this.showToast('Application initialisée en mode hors ligne', 'info');
    }

    bindEvents() {
        // Navigation
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchSection(e.target.dataset.section);
            });
        });

        // Check-list interactivity
        this.bindChecklistEvents();
        
        // Simulation de boutons pour la démo
        this.bindDemoButtons();

        // Service Worker pour PWA
        this.registerServiceWorker();
    }

    switchSection(sectionName) {
        // Masquer toutes les sections
        const sections = document.querySelectorAll('.content-section');
        sections.forEach(section => {
            section.classList.remove('active');
        });

        // Masquer tous les boutons nav actifs
        const navButtons = document.querySelectorAll('.nav-btn');
        navButtons.forEach(btn => {
            btn.classList.remove('active');
        });

        // Afficher la section demandée
        const targetSection = document.getElementById(sectionName);
        if (targetSection) {
            targetSection.classList.add('active');
            this.currentSection = sectionName;
        }

        // Activer le bouton nav correspondant
        const targetNavBtn = document.querySelector(`[data-section="${sectionName}"]`);
        if (targetNavBtn) {
            targetNavBtn.classList.add('active');
        }

        this.showToast(`Navigation vers ${this.getSectionTitle(sectionName)}`, 'info');
    }

    getSectionTitle(sectionName) {
        const titles = {
            'dashboard': 'Tableau de bord',
            'procedures': 'Procédures DT NUC',
            'checklist': 'Check-list',
            'photos': 'Photos & Mesures'
        };
        return titles[sectionName] || sectionName;
    }

    bindChecklistEvents() {
        const checkboxes = document.querySelectorAll('.checklist-item input[type="checkbox"]');
        checkboxes.forEach((checkbox, index) => {
            if (!checkbox.disabled) {
                checkbox.addEventListener('change', (e) => {
                    this.handleChecklistItem(e.target, index);
                });
            }
        });

        // Boutons d'action dans la checklist
        const actionButtons = document.querySelectorAll('.item-actions .btn-small');
        actionButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleChecklistAction(e.target.textContent);
            });
        });
    }

    handleChecklistItem(checkbox, index) {
        const item = checkbox.closest('.checklist-item');
        
        if (checkbox.checked) {
            item.classList.add('completed');
            item.classList.remove('current');
            
            // Ajouter timestamp
            const timestamp = item.querySelector('.timestamp');
            if (!timestamp) {
                const now = new Date().toLocaleTimeString('fr-FR', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                });
                const timestampEl = document.createElement('span');
                timestampEl.className = 'timestamp';
                timestampEl.textContent = `✅ ${now}`;
                item.querySelector('.item-content').appendChild(timestampEl);
            }

            this.showToast('Étape validée avec succès', 'success');
        } else {
            item.classList.remove('completed');
            
            // Supprimer timestamp
            const timestamp = item.querySelector('.timestamp');
            if (timestamp) {
                timestamp.remove();
            }
        }

        this.updateChecklistProgress();
    }

    updateChecklistProgress() {
        const totalItems = document.querySelectorAll('.checklist-item input[type="checkbox"]').length;
        const completedItems = document.querySelectorAll('.checklist-item input[type="checkbox"]:checked').length;
        
        const percentage = (completedItems / totalItems) * 100;
        
        // Mettre à jour la barre de progression
        const progressFill = document.querySelector('.mini-progress-fill');
        if (progressFill) {
            progressFill.style.width = `${percentage}%`;
        }

        // Mettre à jour le texte
        const progressText = document.querySelector('.checklist-progress span');
        if (progressText) {
            progressText.textContent = `${completedItems}/${totalItems} étapes terminées`;
        }

        // Mettre à jour le dashboard aussi
        const dashboardProgress = document.querySelector('.progress-fill');
        const dashboardText = document.querySelector('.progress-text');
        if (dashboardProgress && dashboardText) {
            dashboardProgress.style.width = `${percentage}%`;
            dashboardText.textContent = `${Math.round(percentage)}% terminé`;
        }
    }

    handleChecklistAction(actionText) {
        if (actionText.includes('Photo')) {
            this.simulatePhotoCapture();
        } else if (actionText.includes('Mesure')) {
            this.simulateMeasurement();
        }
    }

    simulatePhotoCapture() {
        this.showToast('📸 Photo capturée - sauvegarde locale', 'success');
        
        // Simuler l'ajout d'une nouvelle photo dans la section médias
        setTimeout(() => {
            this.addMediaItem('photo');
        }, 1000);
    }

    simulateMeasurement() {
        const measurement = (Math.random() * 5 + 10).toFixed(1); // Entre 10.0 et 15.0
        this.showToast(`📏 Mesure enregistrée: ${measurement}mm`, 'success');
        
        setTimeout(() => {
            this.addMediaItem('measurement', `${measurement}mm`);
        }, 1000);
    }

    addMediaItem(type, value = '') {
        const mediaGrid = document.querySelector('.media-grid');
        const timestamp = new Date().toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });

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

    updateSyncCounter() {
        const syncStatus = document.querySelector('.sync-status span');
        if (syncStatus) {
            const currentCount = parseInt(syncStatus.textContent.match(/\d+/)[0]) || 0;
            syncStatus.textContent = `${currentCount + 1} éléments en attente de synchronisation`;
        }
    }

    bindDemoButtons() {
        // Boutons procédures
        const procedureButtons = document.querySelectorAll('.procedure-actions .btn-primary');
        procedureButtons.forEach(btn => {
            if (btn.textContent === 'Ouvrir') {
                btn.addEventListener('click', () => {
                    this.showToast('📋 Ouverture de la procédure...', 'info');
                    // Simuler le passage à la checklist
                    setTimeout(() => {
                        this.switchSection('checklist');
                    }, 1500);
                });
            }
        });

        // Bouton de synchronisation
        const syncButton = document.querySelector('.sync-info .btn-secondary');
        if (syncButton) {
            syncButton.addEventListener('click', () => {
                this.simulateSync();
            });
        }

        // Bouton d'ajout de médias
        const addMediaBtn = document.querySelector('.media-header .btn-primary');
        if (addMediaBtn) {
            addMediaBtn.addEventListener('click', () => {
                this.simulatePhotoCapture();
            });
        }

        // Boutons de mise à jour
        const updateButtons = document.querySelectorAll('.btn-warning');
        updateButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.simulateUpdate();
            });
        });
    }

    simulateSync() {
        this.showToast('🔄 Synchronisation en cours...', 'info');
        
        setTimeout(() => {
            const syncStatus = document.querySelector('.sync-status span');
            if (syncStatus) {
                syncStatus.textContent = 'Tous les éléments sont synchronisés';
            }
            this.showToast('✅ Synchronisation terminée', 'success');
        }, 3000);
    }

    simulateUpdate() {
        this.showToast('⬇️ Téléchargement de la mise à jour...', 'info');
        
        setTimeout(() => {
            this.showToast('✅ Mise à jour installée', 'success');
            
            // Changer le badge
            const updateBadge = document.querySelector('.status-badge.update');
            if (updateBadge) {
                updateBadge.textContent = 'À jour';
                updateBadge.className = 'status-badge current';
            }
        }, 2500);
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

        // Simuler changement de connexion toutes les 30 secondes
        setTimeout(() => {
            this.offlineMode = !this.offlineMode;
            this.updateConnectionStatus();
        }, 30000);
    }

    showToast(message, type = 'info') {
        const toastContainer = document.getElementById('toast-container');
        const toast = document.createElement('div');
        
        const icons = {
            'info': 'ℹ️',
            'success': '✅',
            'warning': '⚠️',
            'error': '❌'
        };

        toast.className = `toast toast-${type}`;
        toast.innerHTML = `
            <span class="toast-icon">${icons[type]}</span>
            <span class="toast-message">${message}</span>
        `;

        // Styles pour les toasts
        toast.style.cssText = `
            display: flex;
            align-items: center;
            gap: 0.5rem;
            background: var(--surface);
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 1rem;
            margin-bottom: 0.5rem;
            box-shadow: var(--shadow-lg);
            animation: slideInRight 0.3s ease;
            max-width: 300px;
            font-size: 0.875rem;
        `;

        toastContainer.appendChild(toast);

        // Supprimer après 4 secondes
        setTimeout(() => {
            toast.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                toastContainer.removeChild(toast);
            }, 300);
        }, 4000);
    }

    loadChecklistData() {
        // Simuler le chargement de données de checklist
        this.checklistData = {
            currentProcedure: 'DT NUC 001',
            totalSteps: 12,
            completedSteps: 5,
            progress: 42
        };
    }

    registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(registration => {
                    console.log('Service Worker enregistré:', registration);
                })
                .catch(error => {
                    console.log('Erreur Service Worker:', error);
                });
        }
    }
}

// Animations CSS additionnelles
const additionalStyles = `
@keyframes slideInRight {
    from {
        opacity: 0;
        transform: translateX(100%);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

@keyframes slideOutRight {
    from {
        opacity: 1;
        transform: translateX(0);
    }
    to {
        opacity: 0;
        transform: translateX(100%);
    }
}

@keyframes slideInUp {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.toast {
    transition: all 0.3s ease;
}

.toast-icon {
    font-size: 1rem;
}
`;

// Ajouter les styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// Initialiser l'application
document.addEventListener('DOMContentLoaded', () => {
    window.dtNucApp = new DTNucApp();
});

// Gestion des événements tactiles pour améliorer l'UX mobile
document.addEventListener('touchstart', function() {}, { passive: true });

// Préventions des zooms accidentels
document.addEventListener('gesturestart', function(e) {
    e.preventDefault();
});

// Gestion hors ligne
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