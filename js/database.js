  // DT NUC Companion - Database Manager (IndexedDB)
  class DatabaseManager {
      constructor() {
          this.dbName = 'DTNucCompanionDB';
          this.dbVersion = 1;
          this.db = null;
          this.stores = {
              procedures: 'procedures',
              checklists: 'checklists',
              media: 'media',
              settings: 'settings',
              syncQueue: 'syncQueue'
          };
      }

      async init() {
          try {
              this.db = await this.openDatabase();
              console.log('✅ Base de données IndexedDB initialisée avec succès');
              await this.initializeDefaultData();
              return true;
          } catch (error) {
              console.error('❌ Erreur initialisation base de données:', error);
              return false;
          }
      }

      openDatabase() {
          return new Promise((resolve, reject) => {
              const request = indexedDB.open(this.dbName, this.dbVersion);
              request.onerror = () => reject(new Error('Erreur ouverture base de données'));
              request.onsuccess = (event) => resolve(event.target.result);
              request.onupgradeneeded = (event) => this.createStores(event.target.result);
          });
      }

      createStores(db) {
          // Store procédures
          if (!db.objectStoreNames.contains(this.stores.procedures)) {
              const procedureStore = db.createObjectStore(this.stores.procedures, {
                  keyPath: 'id', autoIncrement: true
              });
              procedureStore.createIndex('code', 'code', { unique: true });
              procedureStore.createIndex('installation', 'installation', { unique: false });
          }

          // Store médias
          if (!db.objectStoreNames.contains(this.stores.media)) {
              const mediaStore = db.createObjectStore(this.stores.media, {
                  keyPath: 'id', autoIncrement: true
              });
              mediaStore.createIndex('type', 'type', { unique: false });
              mediaStore.createIndex('timestamp', 'timestamp', { unique: false });
          }

          // Store paramètres
          if (!db.objectStoreNames.contains(this.stores.settings)) {
              db.createObjectStore(this.stores.settings, { keyPath: 'key' });
          }

          // Store sync queue
          if (!db.objectStoreNames.contains(this.stores.syncQueue)) {
              const syncStore = db.createObjectStore(this.stores.syncQueue, {
                  keyPath: 'id', autoIncrement: true
              });
              syncStore.createIndex('status', 'status', { unique: false });
          }
      }

      async initializeDefaultData() {
          const existingProcedures = await this.getAllProcedures();
          if (existingProcedures.length === 0) {
              await this.addDefaultProcedures();
          }
      }

      async addDefaultProcedures() {
          const defaultProcedures = [
              {
                  code: 'DT NUC 001', version: '2.3',
                  title: 'Contrôle UT générateur de vapeur',
                  installation: 'REP 900 MW', method: 'Ultrasons (UT)',
                  status: 'current', lastUpdated: new Date().toISOString()
              },
              {
                  code: 'DT NUC 045', version: '1.8',
                  title: 'RT sur tuyauterie primaire',
                  installation: 'REP 1300 MW', method: 'Radiographie (RT)',
                  status: 'available', lastUpdated: new Date().toISOString()
              },
              {
                  code: 'DT NUC 089', version: '3.1',
                  title: 'MT des surfaces accessibles',
                  installation: 'Toutes installations', method: 'Magnétoscopie (MT)',
                  status: 'update_available', lastUpdated: new Date().toISOString()
              }
          ];

          for (const procedure of defaultProcedures) {
              await this.addProcedure(procedure);
          }
      }

      // Méthodes principales
      async addProcedure(procedure) {
          return new Promise((resolve, reject) => {
              const transaction = this.db.transaction([this.stores.procedures], 'readwrite');
              const store = transaction.objectStore(this.stores.procedures);
              const request = store.add(procedure);
              request.onsuccess = () => resolve(request.result);
              request.onerror = () => reject(request.error);
          });
      }

      async getAllProcedures() {
          return new Promise((resolve, reject) => {
              const transaction = this.db.transaction([this.stores.procedures], 'readonly');
              const store = transaction.objectStore(this.stores.procedures);
              const request = store.getAll();
              request.onsuccess = () => resolve(request.result);
              request.onerror = () => reject(request.error);
          });
      }

      async addMedia(media) {
          const mediaItem = { ...media, timestamp: new Date().toISOString(), synced: false };
          return new Promise((resolve, reject) => {
              const transaction = this.db.transaction([this.stores.media], 'readwrite');
              const store = transaction.objectStore(this.stores.media);
              const request = store.add(mediaItem);
              request.onsuccess = () => {
                  this.addToSyncQueue('media', 'create', request.result);
                  resolve(request.result);
              };
              request.onerror = () => reject(request.error);
          });
      }

      async addToSyncQueue(type, action, dataId) {
          const syncItem = {
              type, action, dataId,
              timestamp: new Date().toISOString(),
              status: 'pending', retries: 0
          };
          return new Promise((resolve, reject) => {
              const transaction = this.db.transaction([this.stores.syncQueue], 'readwrite');
              const store = transaction.objectStore(this.stores.syncQueue);
              const request = store.add(syncItem);
              request.onsuccess = () => resolve(request.result);
              request.onerror = () => reject(request.error);
          });
      }

      async getPendingSyncItems() {
          return new Promise((resolve, reject) => {
              const transaction = this.db.transaction([this.stores.syncQueue], 'readonly');
              const store = transaction.objectStore(this.stores.syncQueue);
              const index = store.index('status');
              const request = index.getAll('pending');
              request.onsuccess = () => resolve(request.result);
              request.onerror = () => reject(request.error);
          });
      }

      async getStorageInfo() {
          const info = {};
          for (const [key, storeName] of Object.entries(this.stores)) {
              info[key] = await new Promise((resolve, reject) => {
                  const transaction = this.db.transaction([storeName], 'readonly');
                  const store = transaction.objectStore(storeName);
                  const request = store.count();
                  request.onsuccess = () => resolve(request.result);
                  request.onerror = () => reject(request.error);
              });
          }
          return info;
      }
  }

  window.DatabaseManager = DatabaseManager;
