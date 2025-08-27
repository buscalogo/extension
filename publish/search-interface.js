/**
 * Interface de Busca Avançada - BuscaLogo
 * 
 * Sistema de busca local com filtros avançados para páginas capturadas
 * pela extensão, incluindo paginação e ordenação.
 */

class SearchInterface {
  constructor() {
    this.currentPage = 1;
    this.itemsPerPage = 10;
    this.totalResults = 0;
    this.allResults = [];
    this.filteredResults = [];
    this.currentFilters = {};
    this.isLoading = false;
    
    this.init();
  }
  
  /**
   * Inicializa a interface de busca
   */
  async init() {
    try {
      console.log('🔍 Interface de Busca iniciando...');
      
      // Configura event listeners
      this.setupEventListeners();
      
      // Define data padrão (últimos 30 dias)
      this.setDefaultDates();
      
      // Carrega dados iniciais
      await this.loadInitialData();
      
      console.log('✅ Interface de Busca inicializada');
      
    } catch (error) {
      console.error('❌ Erro ao inicializar interface de busca:', error);
      this.showError('Erro ao inicializar: ' + error.message);
    }
  }
  
  /**
   * Configura event listeners
   */
  setupEventListeners() {
    // Busca
    document.getElementById('searchBtn').addEventListener('click', () => this.performSearch());
    document.getElementById('searchInput').addEventListener('keypress', (e) => {
      if (e.key === 'Enter') this.performSearch();
    });
    
    // Filtros
    document.getElementById('contentTypeFilter').addEventListener('change', () => this.applyFilters());
    document.getElementById('domainFilter').addEventListener('input', () => this.applyFilters());
    document.getElementById('dateFromFilter').addEventListener('change', () => this.applyFilters());
    document.getElementById('dateToFilter').addEventListener('change', () => this.applyFilters());
    
    // Ordenação
    document.getElementById('sortBy').addEventListener('change', () => this.applySorting());
    
    // Paginação
    document.getElementById('prevPage').addEventListener('click', () => this.previousPage());
    document.getElementById('nextPage').addEventListener('click', () => this.nextPage());
    
    // Controles
    document.getElementById('openPopup').addEventListener('click', () => this.openPopup());
    document.getElementById('openDashboard').addEventListener('click', () => this.openDashboard());
  }
  
  /**
   * Define datas padrão para filtros
   */
  setDefaultDates() {
    const today = new Date();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(today.getDate() - 30);
    
    document.getElementById('dateFromFilter').value = thirtyDaysAgo.toISOString().split('T')[0];
    document.getElementById('dateToFilter').value = today.toISOString().split('T')[0];
  }
  
  /**
   * Carrega dados iniciais
   */
  async loadInitialData() {
    try {
      this.setLoading(true);
      
      // Obtém todas as páginas capturadas
      const response = await this.sendMessage('GET_ALL_PAGES');
      
      if (response.success) {
        this.allResults = response.pages || [];
        this.totalResults = this.allResults.length;
        
        console.log(`📊 ${this.totalResults} páginas carregadas`);
        
        // Aplica filtros iniciais
        this.applyFilters();
        
      } else {
        throw new Error(response.error || 'Erro ao carregar páginas');
      }
      
    } catch (error) {
      console.error('❌ Erro ao carregar dados iniciais:', error);
      this.showError('Erro ao carregar dados: ' + error.message);
    } finally {
      this.setLoading(false);
    }
  }
  
  /**
   * Executa a busca
   */
  async performSearch() {
    try {
      const searchTerm = document.getElementById('searchInput').value.trim();
      
      if (!searchTerm) {
        this.showError('Digite um termo de busca');
        return;
      }
      
      this.setLoading(true);
      console.log(`🔍 Executando busca por: "${searchTerm}"`);
      
      // Aplica filtros e busca
      this.applyFilters();
      this.applySearchTerm(searchTerm);
      
      // Reseta para primeira página
      this.currentPage = 1;
      
      // Atualiza interface
      this.updateResults();
      this.updatePagination();
      
      console.log(`✅ Busca concluída: ${this.filteredResults.length} resultados`);
      
    } catch (error) {
      console.error('❌ Erro na busca:', error);
      this.showError('Erro na busca: ' + error.message);
    } finally {
      this.setLoading(false);
    }
  }
  
  /**
   * Aplica filtros selecionados
   */
  applyFilters() {
    try {
      const contentType = document.getElementById('contentTypeFilter').value;
      const domain = document.getElementById('domainFilter').value.trim().toLowerCase();
      const dateFrom = document.getElementById('dateFromFilter').value;
      const dateTo = document.getElementById('dateToFilter').value;
      
      this.currentFilters = {
        contentType,
        domain,
        dateFrom,
        dateTo
      };
      
      console.log('🔧 Aplicando filtros:', this.currentFilters);
      
      // Filtra resultados
      this.filteredResults = this.allResults.filter(page => {
        return this.matchesFilters(page);
      });
      
      // Aplica ordenação
      this.applySorting();
      
      // Atualiza interface
      this.updateResults();
      this.updatePagination();
      
    } catch (error) {
      console.error('❌ Erro ao aplicar filtros:', error);
    }
  }
  
  /**
   * Verifica se uma página corresponde aos filtros
   */
  matchesFilters(page) {
    // Filtro de tipo de conteúdo
    if (this.currentFilters.contentType && page.contentType !== this.currentFilters.contentType) {
      return false;
    }
    
    // Filtro de domínio
    if (this.currentFilters.domain && page.hostname && 
        !page.hostname.toLowerCase().includes(this.currentFilters.domain)) {
      return false;
    }
    
    // Filtro de data
    if (this.currentFilters.dateFrom || this.currentFilters.dateTo) {
      const pageDate = new Date(page.timestamp || page.created_at || Date.now());
      const pageDateStr = pageDate.toISOString().split('T')[0];
      
      if (this.currentFilters.dateFrom && pageDateStr < this.currentFilters.dateFrom) {
        return false;
      }
      
      if (this.currentFilters.dateTo && pageDateStr > this.currentFilters.dateTo) {
        return false;
      }
    }
    
    return true;
  }
  
  /**
   * Aplica termo de busca
   */
  applySearchTerm(searchTerm) {
    if (!searchTerm) return;
    
    const term = searchTerm.toLowerCase();
    
    this.filteredResults = this.filteredResults.filter(page => {
      // Busca no título
      if (page.title && page.title.toLowerCase().includes(term)) {
        return true;
      }
      
      // Busca no conteúdo
      if (page.content && page.content.toLowerCase().includes(term)) {
        return true;
      }
      
      // Busca na URL
      if (page.url && page.url.toLowerCase().includes(term)) {
        return true;
      }
      
      // Busca no hostname
      if (page.hostname && page.hostname.toLowerCase().includes(term)) {
        return true;
      }
      
      return false;
    });
  }
  
  /**
   * Aplica ordenação
   */
  applySorting() {
    const sortBy = document.getElementById('sortBy').value;
    
    console.log('🔄 Aplicando ordenação:', sortBy);
    
    this.filteredResults.sort((a, b) => {
      switch (sortBy) {
        case 'date':
          return (b.timestamp || b.created_at || 0) - (a.timestamp || a.created_at || 0);
          
        case 'date_old':
          return (a.timestamp || a.created_at || 0) - (b.timestamp || b.created_at || 0);
          
        case 'title':
          return (a.title || '').localeCompare(b.title || '');
          
        case 'domain':
          return (a.hostname || '').localeCompare(b.hostname || '');
          
        case 'quality':
          return (b.quality || b.relevance || 0) - (a.quality || a.relevance || 0);
          
        case 'relevance':
        default:
          // Ordenação por relevância (combina múltiplos fatores)
          const scoreA = this.calculateRelevanceScore(a);
          const scoreB = this.calculateRelevanceScore(b);
          return scoreB - scoreA;
      }
    });
  }
  
  /**
   * Calcula score de relevância para uma página
   */
  calculateRelevanceScore(page) {
    let score = 0;
    
    // Score baseado na qualidade/relevância
    if (page.quality) score += page.quality * 10;
    if (page.relevance) score += page.relevance * 10;
    
    // Score baseado na data (páginas mais recentes têm pontuação maior)
    if (page.timestamp || page.created_at) {
      const ageInDays = (Date.now() - (page.timestamp || page.created_at)) / (1000 * 60 * 60 * 24);
      score += Math.max(0, 10 - ageInDays); // Máximo 10 pontos para páginas muito recentes
    }
    
    // Score baseado no tipo de conteúdo
    if (page.contentType === 'article') score += 5;
    if (page.contentType === 'tutorial') score += 4;
    if (page.contentType === 'documentation') score += 3;
    
    // Score baseado no tamanho do conteúdo
    if (page.content && page.content.length > 1000) score += 2;
    
    return score;
  }
  
  /**
   * Atualiza resultados na interface
   */
  updateResults() {
    const resultsList = document.getElementById('resultsList');
    const resultsCount = document.getElementById('resultsCount');
    
    // Atualiza contador
    resultsCount.textContent = `${this.filteredResults.length} resultados`;
    
    // Calcula resultados para a página atual
    const startIndex = (this.currentPage - 1) * this.itemsPerPage;
    const endIndex = startIndex + this.itemsPerPage;
    const pageResults = this.filteredResults.slice(startIndex, endIndex);
    
    if (pageResults.length === 0) {
      resultsList.innerHTML = `
        <div class="no-results">
          ${this.allResults.length === 0 ? 'Nenhuma página capturada ainda.' : 'Nenhum resultado encontrado para os filtros aplicados.'}
        </div>
      `;
      return;
    }
    
    // Renderiza resultados
    resultsList.innerHTML = pageResults.map(page => this.renderResultItem(page)).join('');
  }
  
  /**
   * Renderiza um item de resultado
   */
  renderResultItem(page) {
    const title = page.title || 'Sem título';
    const url = page.url || '#';
    const hostname = page.hostname || 'Domínio desconhecido';
    const timestamp = page.timestamp || page.created_at || Date.now();
    const contentType = page.contentType || 'página';
    const quality = page.quality || page.relevance || 0;
    
    const timeAgo = this.formatTimeAgo(timestamp);
    const qualityPercent = Math.round(quality * 100);
    
    return `
      <div class="result-item">
        <div class="result-title">${this.highlightSearchTerm(title)}</div>
        <div class="result-url">${url}</div>
        <div class="result-meta">
          <span>🌐 ${hostname}</span>
          <span>📅 ${timeAgo}</span>
          <span>📝 ${contentType}</span>
          <span>⭐ ${qualityPercent}%</span>
        </div>
      </div>
    `;
  }
  
  /**
   * Destaca termo de busca no texto
   */
  highlightSearchTerm(text) {
    const searchTerm = document.getElementById('searchInput').value.trim();
    if (!searchTerm || !text) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.replace(regex, '<mark style="background: #FFD700; color: #333; padding: 2px 4px; border-radius: 3px;">$1</mark>');
  }
  
  /**
   * Atualiza paginação
   */
  updatePagination() {
    const pagination = document.getElementById('pagination');
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    const currentPageSpan = document.getElementById('currentPage');
    
    const totalPages = Math.ceil(this.filteredResults.length / this.itemsPerPage);
    
    if (totalPages <= 1) {
      pagination.style.display = 'none';
      return;
    }
    
    pagination.style.display = 'flex';
    
    // Atualiza botões
    prevBtn.disabled = this.currentPage <= 1;
    nextBtn.disabled = this.currentPage >= totalPages;
    
    // Atualiza página atual
    currentPageSpan.textContent = `${this.currentPage} de ${totalPages}`;
  }
  
  /**
   * Vai para página anterior
   */
  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updateResults();
      this.updatePagination();
    }
  }
  
  /**
   * Vai para próxima página
   */
  nextPage() {
    const totalPages = Math.ceil(this.filteredResults.length / this.itemsPerPage);
    if (this.currentPage < totalPages) {
      this.currentPage++;
      this.updateResults();
      this.updatePagination();
    }
  }
  
  /**
   * Formata tempo relativo
   */
  formatTimeAgo(timestamp) {
    const now = Date.now();
    const diff = now - timestamp;
    
    const minutes = Math.floor(diff / (1000 * 60));
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (minutes < 60) {
      return `${minutes}m atrás`;
    } else if (hours < 24) {
      return `${hours}h atrás`;
    } else {
      return `${days}d atrás`;
    }
  }
  
  /**
   * Abre o popup da extensão
   */
  openPopup() {
    try {
      chrome.action.openPopup();
    } catch (error) {
      console.error('❌ Erro ao abrir popup:', error);
      this.showError('Erro ao abrir popup: ' + error.message);
    }
  }
  
  /**
   * Abre o dashboard
   */
  openDashboard() {
    try {
      chrome.tabs.create({
        url: chrome.runtime.getURL('analytics-dashboard.html')
      });
    } catch (error) {
      console.error('❌ Erro ao abrir dashboard:', error);
      this.showError('Erro ao abrir dashboard: ' + error.message);
    }
  }
  
  /**
   * Define estado de loading
   */
  setLoading(loading) {
    this.isLoading = loading;
    
    const searchBtn = document.getElementById('searchBtn');
    if (loading) {
      searchBtn.textContent = '⏳ Buscando...';
      searchBtn.disabled = true;
    } else {
      searchBtn.textContent = '🔍 Buscar';
      searchBtn.disabled = false;
    }
  }
  
  /**
   * Mostra mensagem de erro
   */
  showError(message) {
    this.showMessage(message, 'error');
  }
  
  /**
   * Mostra mensagem de sucesso
   */
  showSuccess(message) {
    this.showMessage(message, 'success');
  }
  
  /**
   * Mostra mensagem
   */
  showMessage(message, type) {
    // Remove mensagem existente
    const existingMessage = document.querySelector('.error-message, .success-message');
    if (existingMessage) {
      existingMessage.remove();
    }
    
    // Cria nova mensagem
    const messageElement = document.createElement('div');
    messageElement.className = type === 'success' ? 'success-message' : 'error-message';
    messageElement.textContent = message;
    
    // Insere após o header
    const header = document.querySelector('.header');
    header.parentNode.insertBefore(messageElement, header.nextSibling);
    
    // Remove após 5 segundos
    setTimeout(() => {
      if (messageElement.parentNode) {
        messageElement.remove();
      }
    }, 5000);
  }
  
  /**
   * Envia mensagem para o background script
   */
  async sendMessage(type, data = {}) {
    return new Promise((resolve, reject) => {
      try {
        chrome.runtime.sendMessage({ type, data }, (response) => {
          if (chrome.runtime.lastError) {
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(response);
          }
        });
      } catch (error) {
        reject(error);
      }
    });
  }
}

// Inicializa a interface quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  window.searchInterface = new SearchInterface();
});
