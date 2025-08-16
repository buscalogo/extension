/**
 * Popup Script - BuscaLogo
 * 
 * Gerencia a interface do popup da extensão e comunicação
 * com o background script para controle e status.
 */

class BuscaLogoPopup {
  constructor() {
    this.elements = {};
    this.isLoading = false;
    this.currentTab = null;
    
    this.init();
  }
  
  /**
   * Inicializa o popup
   */
  async init() {
    try {
      console.log('🚀 Popup BuscaLogo iniciando...');
      
      // Mapeia elementos DOM
      this.mapElements();
      
      // Configura event listeners
      this.setupEventListeners();
      
      // Obtém informações da aba atual
      await this.getCurrentTabInfo();
      
      // Carrega status inicial
      await this.loadStatus();
      
      // Carrega histórico
      await this.loadHistory();
      
      console.log('✅ Popup BuscaLogo inicializado');
      
    } catch (error) {
      console.error('❌ Erro ao inicializar popup:', error);
    }
  }
  
  /**
   * Mapeia elementos DOM
   */
  mapElements() {
    this.elements = {
      // Current page
      currentPageInfo: document.getElementById('currentPageInfo'),
      currentPageUrl: document.getElementById('currentPageUrl'),
      currentPageTitle: document.getElementById('currentPageTitle'),
      capturePage: document.getElementById('capturePage'),
      
      // Status
      status: document.getElementById('status'),
      collectionStatus: document.getElementById('collectionStatus'),
      serverStatus: document.getElementById('serverStatus'),
      peerId: document.getElementById('peerId'),
      totalPages: document.getElementById('totalPages'),
      uniqueHosts: document.getElementById('uniqueHosts'),
      crawlingStatus: document.getElementById('crawlingStatus'),
      queueStatus: document.getElementById('queueStatus'),
      totalDiscovered: document.getElementById('totalDiscovered'),
      totalCaptured: document.getElementById('totalCaptured'),
      totalFailed: document.getElementById('totalFailed'),
      
      // Controls
      refreshStats: document.getElementById('refreshStats'),
      clearData: document.getElementById('clearData'),
      testSearch: document.getElementById('testSearch'), // Adicionado botão de teste de busca
      
      // History
      historyCount: document.getElementById('historyCount'),
      historyList: document.getElementById('historyList'),
      historySection: document.getElementById('history-section')
    };
  }
  
  /**
   * Configura event listeners
   */
  setupEventListeners() {
    this.elements.capturePage.addEventListener('click', () => this.captureCurrentPage());
    this.elements.refreshStats.addEventListener('click', () => { this.loadStatus(); this.loadHistory(); });
    this.elements.testSearch.addEventListener('click', () => this.testSearch());
    this.elements.clearData.addEventListener('click', () => this.clearData());
  }
  
  /**
   * Obtém informações da aba atual
   */
  async getCurrentTabInfo() {
    try {
      // Obtém a aba ativa
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (tab) {
        this.currentTab = tab;
        
        // Verifica se é uma página válida para captura
        const isValidPage = tab.url && 
                           (tab.url.startsWith('http://') || tab.url.startsWith('https://')) &&
                           !tab.url.startsWith('chrome://') &&
                           !tab.url.startsWith('chrome-extension://');
        
        if (isValidPage) {
          // Mostra informações da página
          this.elements.currentPageInfo.style.display = 'block';
          this.elements.currentPageUrl.textContent = tab.url;
          this.elements.currentPageTitle.textContent = tab.title || 'Sem título';
          
          // Habilita botão de captura
          this.elements.capturePage.disabled = false;
          
          // Verifica se a página já foi capturada
          await this.checkIfPageAlreadyCaptured(tab.url);
        } else {
          // Página não válida para captura
          this.elements.currentPageInfo.style.display = 'none';
          this.elements.capturePage.disabled = true;
          this.elements.capturePage.textContent = '🔒 Página não capturável';
        }
      }
      
    } catch (error) {
      console.error('❌ Erro ao obter informações da aba:', error);
    }
  }
  
  /**
   * Verifica se a página já foi capturada
   */
  async checkIfPageAlreadyCaptured(url) {
    try {
      const response = await this.sendMessage('CHECK_PAGE_CAPTURED', { url: url });
      
      if (response.success && response.isCaptured) {
        this.elements.capturePage.textContent = '✅ Já Capturada';
        this.elements.capturePage.disabled = true;
        this.elements.capturePage.className = 'btn btn-secondary';
      } else {
        this.elements.capturePage.textContent = '🔍 Capturar Página Atual';
        this.elements.capturePage.disabled = false;
        this.elements.capturePage.className = 'btn btn-capture';
      }
      
    } catch (error) {
      console.error('❌ Erro ao verificar página:', error);
    }
  }
  
  /**
   * Captura a página atual
   */
  async captureCurrentPage() {
    if (!this.currentTab) return;
    
    try {
      this.setLoading(true);
      this.elements.capturePage.textContent = '⏳ Capturando...';
      
      // Envia comando para capturar a página atual
      const response = await this.sendMessage('CAPTURE_CURRENT_PAGE', {
        tabId: this.currentTab.id,
        url: this.currentTab.url,
        title: this.currentTab.title
      });
      
      if (response.success) {
        // Atualiza interface
        this.elements.capturePage.textContent = '✅ Capturada!';
        this.elements.capturePage.disabled = true;
        this.elements.capturePage.className = 'btn btn-secondary';
        
        // Mostra mensagem de sucesso
        this.showMessage('Página capturada com sucesso!', 'success');
        
        // Atualiza estatísticas e histórico
        await this.loadStatus();
        await this.loadHistory();
        
        // Aguarda um pouco e volta ao estado normal
        setTimeout(() => {
          this.elements.capturePage.textContent = '🔍 Capturar Página Atual';
          this.elements.capturePage.disabled = false;
          this.elements.capturePage.className = 'btn btn-capture';
        }, 2000);
        
      } else {
        throw new Error(response.error || 'Erro ao capturar página');
      }
      
    } catch (error) {
      console.error('❌ Erro ao capturar página:', error);
      this.showMessage('Erro ao capturar página: ' + error.message, 'error');
      
      // Volta ao estado normal
      this.elements.capturePage.textContent = '🔍 Capturar Página Atual';
      this.elements.capturePage.disabled = false;
      this.elements.capturePage.className = 'btn btn-capture';
    } finally {
      this.setLoading(false);
    }
  }
  
  /**
   * Carrega status da extensão
   */
  async loadStatus() {
    try {
      this.setLoading(true);
      
      // Obtém status geral
      const statusResponse = await this.sendMessage('GET_STATUS');
      if (statusResponse.success) {
        this.updateStatusDisplay(statusResponse.status);
      }
      
      // Obtém estatísticas
      const statsResponse = await this.sendMessage('GET_STATS');
      if (statsResponse.success) {
        this.updateStatsDisplay(statsResponse.stats);
      }
      
    } catch (error) {
      console.error('❌ Erro ao carregar status:', error);
      this.elements.status.textContent = 'Erro ao carregar';
    } finally {
      this.setLoading(false);
    }
  }
  
  /**
   * Carrega histórico de capturas
   */
  async loadHistory() {
    try {
      const response = await this.sendMessage('GET_CAPTURE_HISTORY');
      
      if (response.success) {
        this.updateHistoryDisplay(response.history);
      }
      
    } catch (error) {
      console.error('❌ Erro ao carregar histórico:', error);
    }
  }
  
  /**
   * Atualiza display de status
   */
  updateStatusDisplay(status) {
    this.elements.status.textContent = 'Ativo';
    this.elements.collectionStatus.textContent = status.isCollecting ? 'Manual' : 'Desativada';
    
    // Status do servidor
    if (status.serverConnection === 'Conectado') {
      this.elements.serverStatus.textContent = 'Conectado';
      this.elements.serverStatus.style.color = '#4CAF50';
    } else {
      this.elements.serverStatus.textContent = 'Desconectado';
      this.elements.serverStatus.style.color = '#f44336';
    }
    
    // Peer ID
    if (status.peerId && status.peerId !== 'Não definido') {
      this.elements.peerId.textContent = status.peerId;
      this.elements.peerId.style.color = '#2196F3';
    } else {
      this.elements.peerId.textContent = 'Não definido';
      this.elements.peerId.style.color = '#9E9E9E';
    }

    // Status do Crawling
    if (status.isCrawling) {
      this.elements.crawlingStatus.textContent = 'Crawling Ativo';
      this.elements.crawlingStatus.style.color = '#4CAF50';
    } else {
      this.elements.crawlingStatus.textContent = 'Crawling Inativo';
      this.elements.crawlingStatus.style.color = '#f44336';
    }
    
    // Status da fila
    if (status.queueSize > 0) {
      this.elements.queueStatus.textContent = `${status.queueSize} páginas na fila`;
      this.elements.queueStatus.style.color = '#FF9800';
    } else {
      this.elements.queueStatus.textContent = 'Fila vazia';
      this.elements.queueStatus.style.color = '#4CAF50';
    }
    
    // Estatísticas do crawling
    if (status.crawlingStats) {
      this.elements.totalDiscovered.textContent = status.crawlingStats.totalDiscovered;
      this.elements.totalCaptured.textContent = status.crawlingStats.totalCaptured;
      this.elements.totalFailed.textContent = status.crawlingStats.totalFailed;
    }
  }
  
  /**
   * Atualiza display de estatísticas
   */
  updateStatsDisplay(stats) {
    this.elements.totalPages.textContent = stats.totalPages || 0;
    this.elements.uniqueHosts.textContent = stats.uniqueHosts || 0;
  }
  
  /**
   * Atualiza display de histórico
   */
  updateHistoryDisplay(history) {
    const historyList = this.elements.historyList;
    const historyCount = this.elements.historyCount;
    
    // Atualiza contador
    historyCount.textContent = history.length;
    
    // Limpa lista atual
    historyList.innerHTML = '';
    
    if (history.length === 0) {
      historyList.innerHTML = '<div class="history-item"><span class="history-item-title">Nenhuma página capturada</span></div>';
      return;
    }
    
    // Adiciona itens do histórico
    history.forEach(item => {
      const historyItem = document.createElement('div');
      historyItem.className = 'history-item';
      
      const title = document.createElement('span');
      title.className = 'history-item-title';
      title.textContent = item.title || 'Sem título';
      title.title = item.url; // Tooltip com URL completa
      
      const date = document.createElement('span');
      date.className = 'history-item-date';
      date.textContent = this.formatDate(item.timestamp);
      
      historyItem.appendChild(title);
      historyItem.appendChild(date);
      historyList.appendChild(historyItem);
    });
  }
  
  /**
   * Formata timestamp para exibição
   */
  formatDate(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    
    if (diff < 60000) { // Menos de 1 minuto
      return 'Agora';
    } else if (diff < 3600000) { // Menos de 1 hora
      const minutes = Math.floor(diff / 60000);
      return `${minutes}m atrás`;
    } else if (diff < 86400000) { // Menos de 1 dia
      const hours = Math.floor(diff / 3600000);
      return `${hours}h atrás`;
    } else {
      return date.toLocaleDateString('pt-BR');
    }
  }
  
  /**
   * Limpa todos os dados
   */
  async clearData() {
    if (!confirm('Tem certeza que deseja limpar todos os dados coletados? Esta ação não pode ser desfeita.')) {
      return;
    }
    
    try {
      this.setLoading(true);
      
      const response = await this.sendMessage('CLEAR_DATA');
      if (response.success) {
        this.updateStatsDisplay({ totalPages: 0, uniqueHosts: 0 });
        this.updateHistoryDisplay([]);
        this.showMessage('Dados limpos com sucesso', 'success');
      }
      
    } catch (error) {
      console.error('❌ Erro ao limpar dados:', error);
      this.showMessage('Erro ao limpar dados: ' + error.message, 'error');
    } finally {
      this.setLoading(false);
    }
  }
  
  /**
   * Envia mensagem para o background script
   */
  async sendMessage(type, data = {}) {
    console.log(`📤 Enviando mensagem: ${type}`, data);
    
    return new Promise((resolve, reject) => {
      try {
        chrome.runtime.sendMessage({ type, data }, (response) => {
          console.log(`📥 Resposta recebida para ${type}:`, response);
          
          if (chrome.runtime.lastError) {
            console.error(`❌ Erro para ${type}:`, chrome.runtime.lastError);
            reject(new Error(chrome.runtime.lastError.message));
          } else {
            resolve(response);
          }
        });
      } catch (error) {
        console.error(`❌ Exceção para ${type}:`, error);
        reject(error);
      }
    });
  }
  
  /**
   * Define estado de loading
   */
  setLoading(loading) {
    this.isLoading = loading;
    
    if (loading) {
      this.elements.capturePage.disabled = true;
      this.elements.refreshStats.disabled = true;
      this.elements.clearData.disabled = true;
      this.elements.testSearch.disabled = true; // Desabilita botão de teste de busca
    } else {
      this.elements.capturePage.disabled = false;
      this.elements.refreshStats.disabled = false;
      this.elements.clearData.disabled = false;
      this.elements.testSearch.disabled = false; // Habilita botão de teste de busca
    }
  }
  
  /**
   * Mostra mensagem de feedback
   */
  showMessage(message, type = 'info') {
    // Remove mensagem existente
    const existingMessage = document.querySelector('.success-message, .error-message');
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
    
    // Remove após 3 segundos
    setTimeout(() => {
      if (messageElement.parentNode) {
        messageElement.remove();
      }
    }, 3000);
  }

  /**
   * Testa busca local
   */
  async testSearch() {
    try {
      this.setLoading(true);
      this.elements.testSearch.textContent = '🔍 Testando...';
      
      // Testa busca com termo "linux"
      const response = await this.sendMessage('SEARCH_REQUEST', { query: 'linux' });
      
      if (response.success) {
        console.log('✅ Teste de busca bem-sucedido:', response);
        this.showMessage(`Busca testada: ${response.results.total} resultados encontrados`, 'success');
      } else {
        console.error('❌ Teste de busca falhou:', response);
        this.showMessage('Erro no teste de busca: ' + response.error, 'error');
      }
      
    } catch (error) {
      console.error('❌ Erro no teste de busca:', error);
      this.showMessage('Erro no teste de busca: ' + error.message, 'error');
    } finally {
      this.setLoading(false);
      this.elements.testSearch.textContent = 'Testar Busca';
    }
  }
}

// Inicializa o popup quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  new BuscaLogoPopup();
});
