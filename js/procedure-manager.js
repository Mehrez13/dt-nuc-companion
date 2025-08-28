  // DT NUC Companion - Gestionnaire de Procédures Avancé
  class ProcedureManager {
      constructor(dbManager) {
          this.dbManager = dbManager;
          this.searchIndex = new Map(); // Index de recherche full-text
          this.init();
      }

      async init() {
          await this.buildSearchIndex();
          console.log('📋 ProcedureManager initialisé avec index de recherche');
      }

      // Construction de l'index de recherche full-text
      async buildSearchIndex() {
          try {
              const procedures = await this.dbManager.getAllProcedures();

              procedures.forEach(procedure => {
                  const searchableText = [
                      procedure.code,
                      procedure.title,
                      procedure.description,
                      procedure.installation,
                      procedure.method,
                      procedure.keywords || ''
                  ].join(' ').toLowerCase();

                  // Créer l'index par mots
                  const words = searchableText.split(/\s+/).filter(word => word.length > 2);
                  words.forEach(word => {
                      if (!this.searchIndex.has(word)) {
                          this.searchIndex.set(word, new Set());
                      }
                      this.searchIndex.get(word).add(procedure.id);
                  });
              });

              console.log(`🔍 Index de recherche construit: ${this.searchIndex.size} mots indexés`);
          } catch (error) {
              console.error('❌ Erreur construction index:', error);
          }
      }

      // Recherche full-text avancée
      async searchProcedures(query, filters = {}) {
          try {
              const searchTerms = query.toLowerCase().split(/\s+/).filter(term => term.length > 2);
              const allProcedures = await this.dbManager.getAllProcedures();

              if (searchTerms.length === 0) {
                  return this.applyFilters(allProcedures, filters);
              }

              // Trouver les procédures correspondantes
              const matchingIds = new Set();
              const relevanceScores = new Map();

              searchTerms.forEach(term => {
                  // Recherche exacte
                  if (this.searchIndex.has(term)) {
                      this.searchIndex.get(term).forEach(id => {
                          matchingIds.add(id);
                          relevanceScores.set(id, (relevanceScores.get(id) || 0) + 2);
                      });
                  }

                  // Recherche partielle (commence par)
                  for (const [indexedWord, procedureIds] of this.searchIndex.entries()) {
                      if (indexedWord.startsWith(term)) {
                          procedureIds.forEach(id => {
                              matchingIds.add(id);
                              relevanceScores.set(id, (relevanceScores.get(id) || 0) + 1);
                          });
                      }
                  }
              });

              // Filtrer et trier par pertinence
              let results = allProcedures.filter(proc => matchingIds.has(proc.id));
              results = results.sort((a, b) => {
                  return (relevanceScores.get(b.id) || 0) - (relevanceScores.get(a.id) || 0);
              });

              return this.applyFilters(results, filters);
          } catch (error) {
              console.error('❌ Erreur recherche:', error);
              return [];
          }
      }

      // Appliquer les filtres
      applyFilters(procedures, filters) {
          let filtered = [...procedures];

          if (filters.installation && filters.installation !== 'Toutes les installations') {
              filtered = filtered.filter(proc => proc.installation === filters.installation);
          }

          if (filters.method && filters.method !== 'Toutes les méthodes') {
              filtered = filtered.filter(proc => proc.method === filters.method);
          }

          if (filters.status) {
              filtered = filtered.filter(proc => proc.status === filters.status);
          }

          if (filters.version) {
              filtered = filtered.filter(proc => proc.version === filters.version);
          }

          return filtered;
      }

      // Upload d'une nouvelle procédure
      async uploadProcedure(file, metadata) {
          try {
              const fileData = await this.readFileAsArrayBuffer(file);
              const procedure = {
                  code: metadata.code,
                  version: metadata.version || '1.0',
                  title: metadata.title,
                  description: metadata.description || '',
                  installation: metadata.installation,
                  method: metadata.method,
                  keywords: metadata.keywords || '',
                  fileData: fileData,
                  fileName: file.name,
                  fileSize: file.size,
                  fileType: file.type,
                  uploadedAt: new Date().toISOString(),
                  lastUpdated: new Date().toISOString(),
                  status: 'available',
                  annotations: [],
                  viewCount: 0
              };

              const procedureId = await this.dbManager.addProcedure(procedure);

              // Mettre à jour l'index de recherche
              await this.addToSearchIndex(procedure);

              console.log(`📋 Procédure uploadée: ${procedure.code} v${procedure.version}`);
              return procedureId;

          } catch (error) {
              console.error('❌ Erreur upload procédure:', error);
              throw error;
          }
      }

      // Lire un fichier comme ArrayBuffer
      readFileAsArrayBuffer(file) {
          return new Promise((resolve, reject) => {
              const reader = new FileReader();
              reader.onload = (event) => resolve(event.target.result);
              reader.onerror = (error) => reject(error);
              reader.readAsArrayBuffer(file);
          });
      }

      // Télécharger une procédure
      async downloadProcedure(procedureId) {
          try {
              const procedure = await this.dbManager.getProcedureById(procedureId);
              if (!procedure || !procedure.fileData) {
                  throw new Error('Procédure ou fichier non trouvé');
              }

              // Créer un blob et déclencher le téléchargement
              const blob = new Blob([procedure.fileData], { type: procedure.fileType });
              const url = URL.createObjectURL(blob);

              const a = document.createElement('a');
              a.href = url;
              a.download = procedure.fileName || `${procedure.code}_v${procedure.version}.pdf`;
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
              URL.revokeObjectURL(url);

              // Incrémenter le compteur de vues
              await this.incrementViewCount(procedureId);

              console.log(`📥 Procédure téléchargée: ${procedure.code}`);

          } catch (error) {
              console.error('❌ Erreur téléchargement:', error);
              throw error;
          }
      }

      // Créer une nouvelle version d'une procédure
      async createNewVersion(originalId, file, versionNotes = '') {
          try {
              const originalProcedure = await this.dbManager.getProcedureById(originalId);
              if (!originalProcedure) {
                  throw new Error('Procédure originale non trouvée');
              }

              // Calculer la nouvelle version
              const currentVersion = parseFloat(originalProcedure.version);
              const newVersion = (currentVersion + 0.1).toFixed(1);

              const fileData = await this.readFileAsArrayBuffer(file);

              const newProcedure = {
                  ...originalProcedure,
                  version: newVersion,
                  fileData: fileData,
                  fileName: file.name,
                  fileSize: file.size,
                  parentId: originalId,
                  versionNotes: versionNotes,
                  uploadedAt: new Date().toISOString(),
                  lastUpdated: new Date().toISOString(),
                  status: 'current',
                  viewCount: 0
              };

              // Marquer l'ancienne version comme obsolète
              await this.dbManager.updateProcedure(originalId, { status: 'obsolete' });

              const newId = await this.dbManager.addProcedure(newProcedure);
              await this.addToSearchIndex(newProcedure);

              console.log(`📋 Nouvelle version créée: ${newProcedure.code} v${newVersion}`);
              return newId;

          } catch (error) {
              console.error('❌ Erreur création version:', error);
              throw error;
          }
      }

      // Ajouter une annotation à une procédure
      async addAnnotation(procedureId, annotation) {
          try {
              const procedure = await this.dbManager.getProcedureById(procedureId);
              if (!procedure) {
                  throw new Error('Procédure non trouvée');
              }

              const newAnnotation = {
                  id: Date.now(),
                  text: annotation.text,
                  author: annotation.author || 'Technicien',
                  timestamp: new Date().toISOString(),
                  page: annotation.page || 1,
                  position: annotation.position || { x: 0, y: 0 },
                  type: annotation.type || 'note' // note, warning, correction
              };

              const annotations = procedure.annotations || [];
              annotations.push(newAnnotation);

              await this.dbManager.updateProcedure(procedureId, {
                  annotations,
                  lastUpdated: new Date().toISOString()
              });

              console.log(`📝 Annotation ajoutée à ${procedure.code}`);
              return newAnnotation.id;

          } catch (error) {
              console.error('❌ Erreur ajout annotation:', error);
              throw error;
          }
      }

      // Obtenir l'historique des versions
      async getVersionHistory(code) {
          try {
              const allProcedures = await this.dbManager.getAllProcedures();
              const versions = allProcedures
                  .filter(proc => proc.code === code)
                  .sort((a, b) => parseFloat(b.version) - parseFloat(a.version));

              return versions;
          } catch (error) {
              console.error('❌ Erreur historique versions:', error);
              return [];
          }
      }

      // Statistiques des procédures
      async getProcedureStats() {
          try {
              const procedures = await this.dbManager.getAllProcedures();

              const stats = {
                  total: procedures.length,
                  byStatus: {},
                  byInstallation: {},
                  byMethod: {},
                  totalSize: 0,
                  mostViewed: null,
                  recentlyUpdated: []
              };

              procedures.forEach(proc => {
                  // Par statut
                  stats.byStatus[proc.status] = (stats.byStatus[proc.status] || 0) + 1;

                  // Par installation
                  stats.byInstallation[proc.installation] = (stats.byInstallation[proc.installation] || 0) + 1;

                  // Par méthode
                  stats.byMethod[proc.method] = (stats.byMethod[proc.method] || 0) + 1;

                  // Taille totale
                  stats.totalSize += proc.fileSize || 0;

                  // Plus consulté
                  if (!stats.mostViewed || (proc.viewCount || 0) > (stats.mostViewed.viewCount || 0)) {
                      stats.mostViewed = proc;
                  }
              });

              // Récemment mis à jour (7 derniers jours)
              const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
              stats.recentlyUpdated = procedures
                  .filter(proc => new Date(proc.lastUpdated) > weekAgo)
                  .sort((a, b) => new Date(b.lastUpdated) - new Date(a.lastUpdated));

              return stats;
          } catch (error) {
              console.error('❌ Erreur statistiques:', error);
              return null;
          }
      }

      // Méthodes utilitaires privées
      async addToSearchIndex(procedure) {
          const searchableText = [
              procedure.code,
              procedure.title,
              procedure.description,
              procedure.installation,
              procedure.method,
              procedure.keywords || ''
          ].join(' ').toLowerCase();

          const words = searchableText.split(/\s+/).filter(word => word.length > 2);
          words.forEach(word => {
              if (!this.searchIndex.has(word)) {
                  this.searchIndex.set(word, new Set());
              }
              this.searchIndex.get(word).add(procedure.id);
          });
      }

      async incrementViewCount(procedureId) {
          try {
              const procedure = await this.dbManager.getProcedureById(procedureId);
              if (procedure) {
                  await this.dbManager.updateProcedure(procedureId, {
                      viewCount: (procedure.viewCount || 0) + 1,
                      lastViewed: new Date().toISOString()
                  });
              }
          } catch (error) {
              console.error('❌ Erreur incrémentation vues:', error);
          }
      }
  }

  // Export pour utilisation
  window.ProcedureManager = ProcedureManager;
