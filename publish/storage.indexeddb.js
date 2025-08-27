/**
 * IndexedDB Storage Wrapper - BuscaLogo
 * 
 * Gerencia o armazenamento local dos dados coletados das páginas
 * usando IndexedDB para persistência e consultas eficientes.
 */

class IndexedDBStorage {
  constructor() {
    this.dbName = 'BuscaLogoDB';
    this.dbVersion = 1;
    this.db = null;
    this.isInitialized = false;
  }
  
  /**
   * Inicializa o banco de dados
   */
  async init() {
    if (this.isInitialized) return this.db;
    
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);
      
      request.onerror = () => {
        console.error('❌ Erro ao abrir IndexedDB:', request.error);
        reject(request.error);
      };
      
      request.onsuccess = () => {
        this.db = request.result;
        this.isInitialized = true;
        console.log('✅ IndexedDB inicializado com sucesso');
        resolve(this.db);
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Cria store para páginas
        if (!db.objectStoreNames.contains('pages')) {
          const pagesStore = db.createObjectStore('pages', { keyPath: 'url' });
          pagesStore.createIndex('hostname', 'hostname', { unique: false });
          pagesStore.createIndex('timestamp', 'timestamp', { unique: false });
          pagesStore.createIndex('terms', 'terms', { unique: false, multiEntry: true });
        }
        
        // Cria store para termos de busca
        if (!db.objectStoreNames.contains('searchTerms')) {
          const termsStore = db.createObjectStore('searchTerms', { keyPath: 'term' });
          termsStore.createIndex('frequency', 'frequency', { unique: false });
          termsStore.createIndex('lastSeen', 'lastSeen', { unique: false });
        }
        
        // Cria store para estatísticas
        if (!db.objectStoreNames.contains('stats')) {
          const statsStore = db.createObjectStore('stats', { keyPath: 'key' });
        }
        
        console.log('🔄 IndexedDB schema atualizado');
      };
    });
  }
  
  /**
   * Salva dados de uma página
   */
  async savePage(pageData) {
    await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['pages', 'searchTerms', 'stats'], 'readwrite');
      
      // Salva página
      const pagesStore = transaction.objectStore('pages');
      const pageRequest = pagesStore.put(pageData);
      
      pageRequest.onsuccess = () => {
        // Atualiza termos de busca
        this.updateSearchTerms(pageData.terms, pageData.timestamp);
        
        // Atualiza estatísticas
        this.updateStats(pageData.hostname);
        
        resolve(pageData);
      };
      
      pageRequest.onerror = () => {
        reject(pageRequest.error);
      };
      
      transaction.oncomplete = () => {
        console.log('💾 Página salva:', pageData.url);
      };
    });
  }
  
  /**
   * Atualiza termos de busca
   */
  async updateSearchTerms(terms, timestamp) {
    const transaction = this.db.transaction(['searchTerms'], 'readwrite');
    const termsStore = transaction.objectStore('searchTerms');
    
    for (const term of terms) {
      const getRequest = termsStore.get(term);
      
      getRequest.onsuccess = () => {
        const existing = getRequest.result;
        const updated = {
          term: term,
          frequency: (existing?.frequency || 0) + 1,
          lastSeen: timestamp,
          firstSeen: existing?.firstSeen || timestamp
        };
        
        termsStore.put(updated);
      };
    }
  }
  
  /**
   * Atualiza estatísticas
   */
  async updateStats(hostname) {
    const transaction = this.db.transaction(['stats'], 'readwrite');
    const statsStore = transaction.objectStore('stats');
    
    // Conta total de páginas
    const totalRequest = statsStore.get('totalPages');
    totalRequest.onsuccess = () => {
      const total = (totalRequest.result?.value || 0) + 1;
      statsStore.put({ key: 'totalPages', value: total });
    };
    
    // Conta hosts únicos
    const hostsRequest = statsStore.get('uniqueHosts');
    hostsRequest.onsuccess = () => {
      const hosts = hostsRequest.result?.value || new Set();
      hosts.add(hostname);
      statsStore.put({ key: 'uniqueHosts', value: hosts });
    };
  }
  
  /**
   * Busca páginas por termo
   */
  async searchPages(query, limit = 50) {
    await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['pages'], 'readonly');
      const pagesStore = transaction.objectStore('pages');
      const request = pagesStore.getAll();
      
      request.onsuccess = () => {
        const pages = request.result;
        const results = [];
        
        // Busca simples por termo
        const queryLower = query.toLowerCase();
        
        for (const page of pages) {
          let score = 0;
          
          // Pontua por título
          if (page.title.toLowerCase().includes(queryLower)) {
            score += 10;
          }
          
          // Pontua por meta description
          if (page.meta.description?.toLowerCase().includes(queryLower)) {
            score += 8;
          }
          
          // Pontua por headings
          for (const heading of page.headings) {
            if (heading.text.toLowerCase().includes(queryLower)) {
              score += 6;
            }
          }
          
          // Pontua por parágrafos
          for (const paragraph of page.paragraphs) {
            if (paragraph.toLowerCase().includes(queryLower)) {
              score += 2;
            }
          }
          
          // Pontua por termos exatos
          if (page.terms.includes(queryLower)) {
            score += 5;
          }
          
          if (score > 0) {
            results.push({
              ...page,
              score: score
            });
          }
        }
        
        // Ordena por score e limita resultados
        results.sort((a, b) => b.score - a.score);
        resolve(results.slice(0, limit));
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  }
  
  /**
   * Obtém estatísticas do banco
   */
  async getStats() {
    await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['stats'], 'readonly');
      const statsStore = transaction.objectStore('stats');
      const request = statsStore.getAll();
      
      request.onsuccess = () => {
        const stats = {};
        request.result.forEach(stat => {
          stats[stat.key] = stat.value;
        });
        
        resolve({
          totalPages: stats.totalPages || 0,
          uniqueHosts: stats.uniqueHosts ? stats.uniqueHosts.size : 0,
          lastUpdated: Date.now()
        });
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  }
  
  /**
   * Obtém uma página específica por URL
   */
  async getPageByUrl(url) {
    await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['pages'], 'readonly');
      const pagesStore = transaction.objectStore('pages');
      const request = pagesStore.get(url);
      
      request.onsuccess = () => {
        resolve(request.result || null);
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  }

  /**
   * Obtém todas as páginas de um host específico
   */
  async getPagesByHost(hostname) {
    await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['pages'], 'readonly');
      const pagesStore = transaction.objectStore('pages');
      const hostIndex = pagesStore.index('hostname');
      const request = hostIndex.getAll(hostname);
      
      request.onsuccess = () => {
        resolve(request.result);
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  }
  
  /**
   * Remove páginas antigas (mais de 30 dias)
   */
  async cleanupOldPages() {
    await this.init();
    
    const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['pages'], 'readwrite');
      const pagesStore = transaction.objectStore('pages');
      const timestampIndex = pagesStore.index('timestamp');
      const request = timestampIndex.openCursor(IDBKeyRange.upperBound(thirtyDaysAgo));
      
      let deletedCount = 0;
      
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          cursor.delete();
          deletedCount++;
          cursor.continue();
        } else {
          console.log(`🧹 ${deletedCount} páginas antigas removidas`);
          resolve(deletedCount);
        }
      };
      
      request.onerror = () => {
        reject(request.error);
      };
    });
  }
  
  /**
   * Limpa todo o banco de dados
   */
  async clearAll() {
    await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction(['pages', 'searchTerms', 'stats'], 'readwrite');
      
      const pagesStore = transaction.objectStore('pages');
      const termsStore = transaction.objectStore('searchTerms');
      const statsStore = transaction.objectStore('stats');
      
      pagesStore.clear();
      termsStore.clear();
      statsStore.clear();
      
      transaction.oncomplete = () => {
        console.log('🗑️ Banco de dados limpo');
        resolve();
      };
      
      transaction.onerror = () => {
        reject(transaction.error);
      };
    });
  }
}

// Exporta para uso em outros módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = IndexedDBStorage;
} else if (typeof window !== 'undefined') {
  window.IndexedDBStorage = IndexedDBStorage;
}
