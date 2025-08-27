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
      console.log('🚀 Popup aberto em:', new Date().toISOString());
      
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
      
      // Carrega contagem de favoritos
      await this.loadFavoritesCount();
      
      // Carrega configurações de notificação
      await this.loadNotificationSettings();
      
      // Carrega configurações do botão flutuante
      await this.loadFloatingCaptureSettings();
      
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
      openSearch: document.getElementById('openSearch'), // Botão da busca avançada
      openDashboard: document.getElementById('openDashboard'), // Botão do dashboard
      
      // Notification Settings
      notificationsEnabled: document.getElementById('notificationsEnabled'),
      newPageNotifications: document.getElementById('newPageNotifications'),
      crawlingNotifications: document.getElementById('crawlingNotifications'),
      connectionNotifications: document.getElementById('connectionNotifications'),
      showBadge: document.getElementById('showBadge'),
      showAlreadyCaptured: document.getElementById('showAlreadyCaptured'),
      testNotification: document.getElementById('testNotification'),
      saveNotificationSettings: document.getElementById('saveNotificationSettings'),
      
      // Floating Capture Settings
      floatingCaptureEnabled: document.getElementById('floatingCaptureEnabled'),
      floatingCaptureAutoHide: document.getElementById('floatingCaptureAutoHide'),
      floatingCaptureShowTitle: document.getElementById('floatingCaptureShowTitle'),
      testFloatingCapture: document.getElementById('testFloatingCapture'),
      openTestPage: document.getElementById('openTestPage'),
      testDatabase: document.getElementById('testDatabase'),
      injectContentScript: document.getElementById('injectContentScript'),
      saveFloatingCaptureSettings: document.getElementById('saveFloatingCaptureSettings'),
      
      // History
      historyCount: document.getElementById('historyCount'),
      historyList: document.getElementById('historyList'),
      historySection: document.getElementById('history-section'),
      
      // Favorites
      favoritesCount: document.getElementById('favoritesCount'),
      importFavorites: document.getElementById('importFavorites'),
      refreshFavorites: document.getElementById('refreshFavorites'),
      favoritesStatus: document.getElementById('favoritesStatus'),
      favoritesStatusText: document.getElementById('favoritesStatusText')
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
    this.elements.openSearch.addEventListener('click', () => this.openSearch());
    this.elements.openDashboard.addEventListener('click', () => this.openDashboard());
    
    // Notification settings event listeners
    this.elements.testNotification.addEventListener('click', () => this.testNotification());
    this.elements.saveNotificationSettings.addEventListener('click', () => this.saveNotificationSettings());
    
    // Favorites event listeners
    this.elements.importFavorites.addEventListener('click', () => this.importFavorites());
    this.elements.refreshFavorites.addEventListener('click', () => this.loadFavoritesCount());
    
    // Floating capture settings event listeners
    this.elements.testFloatingCapture.addEventListener('click', () => this.testFloatingCapture());
    this.elements.openTestPage.addEventListener('click', () => this.openTestPage());
    this.elements.testDatabase.addEventListener('click', () => this.testDatabase());
    this.elements.injectContentScript.addEventListener('click', () => this.injectContentScript());
    this.elements.saveFloatingCaptureSettings.addEventListener('click', () => this.saveFloatingCaptureSettings());
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
          
          // Verifica se a página já foi capturada (só se a URL for válida)
          if (tab.url && tab.url.length > 0) {
            console.log('🎯 Popup: URL válida encontrada, verificando captura...');
            await this.checkIfPageAlreadyCaptured(tab.url);
          } else {
            console.warn('⚠️ Popup: URL da aba está vazia, pulando verificação');
          }
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
      console.log('🎯 Popup: Verificando se página já foi capturada para URL:', url);
      
      // Valida se a URL é válida antes de enviar
      if (!url || typeof url !== 'string' || url.length === 0) {
        console.warn('⚠️ Popup: URL inválida, não enviando mensagem:', url);
        return;
      }
      
      console.log('🎯 Popup: URL válida, enviando mensagem...');
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
      this.elements.importFavorites.disabled = true;
      this.elements.refreshFavorites.disabled = true;
      this.elements.testFloatingCapture.disabled = true;
      this.elements.openTestPage.disabled = true;
      this.elements.saveFloatingCaptureSettings.disabled = true;
      this.elements.saveNotificationSettings.disabled = true;
    } else {
      this.elements.capturePage.disabled = false;
      this.elements.refreshStats.disabled = false;
      this.elements.clearData.disabled = false;
      this.elements.testSearch.disabled = false; // Habilita botão de teste de busca
      this.elements.importFavorites.disabled = false;
      this.elements.refreshFavorites.disabled = false;
      this.elements.testFloatingCapture.disabled = false;
      this.elements.openTestPage.disabled = false;
      this.elements.saveFloatingCaptureSettings.disabled = false;
      this.elements.saveNotificationSettings.disabled = false;
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
  
  /**
   * Carrega configurações de notificação
   */
  async loadNotificationSettings() {
    try {
      const response = await this.sendMessage('GET_NOTIFICATION_SETTINGS');
      
      if (response.success) {
        const settings = response.settings;
        
        // Atualiza checkboxes
        this.elements.notificationsEnabled.checked = settings.enabled;
        this.elements.newPageNotifications.checked = settings.newPageCaptured;
        this.elements.crawlingNotifications.checked = settings.crawlingProgress;
        this.elements.connectionNotifications.checked = settings.connectionStatus;
        this.elements.showBadge.checked = settings.showBadge;
        this.elements.showAlreadyCaptured.checked = settings.showAlreadyCaptured;
        
        console.log('🔔 Configurações de notificação carregadas');
      }
      
    } catch (error) {
      console.error('❌ Erro ao carregar configurações de notificação:', error);
    }
  }
  
  /**
   * Salva configurações de notificação
   */
  async saveNotificationSettings() {
    try {
      console.log('🔔 BuscaLogo: Salvando configurações de notificação...');
      
      this.setLoading(true);
      this.elements.saveNotificationSettings.textContent = '💾 Salvando...';
      
      const settings = {
        enabled: this.elements.notificationsEnabled.checked,
        newPageCaptured: this.elements.newPageNotifications.checked,
        crawlingProgress: this.elements.crawlingNotifications.checked,
        connectionStatus: this.elements.connectionNotifications.checked,
        showBadge: this.elements.showBadge.checked,
        showAlreadyCaptured: this.elements.showAlreadyCaptured.checked
      };
      
      const response = await this.sendMessage('UPDATE_NOTIFICATION_SETTINGS', { settings });
      
      if (response.success) {
        console.log('✅ Configurações de notificação salvas:', settings);
        this.showMessage('Configurações salvas com sucesso!', 'success');
        
        // Recarrega as configurações para confirmar
        await this.loadNotificationSettings();
      } else {
        throw new Error(response.error || 'Erro ao salvar configurações');
      }
      
    } catch (error) {
      console.error('❌ Erro ao salvar configurações de notificação:', error);
      this.showMessage('Erro ao salvar configurações: ' + error.message, 'error');
    } finally {
      this.setLoading(false);
      this.elements.saveNotificationSettings.textContent = '💾 Salvar';
    }
  }
  
  /**
   * Testa notificação
   */
  async testNotification() {
    try {
      this.setLoading(true);
      this.elements.testNotification.textContent = '🧪 Testando...';
      
      const response = await this.sendMessage('TEST_NOTIFICATION');
      
      if (response.success) {
        console.log('✅ Teste de notificação bem-sucedido');
        this.showMessage('Notificação de teste enviada!', 'success');
      } else {
        throw new Error(response.error || 'Erro no teste de notificação');
      }
      
    } catch (error) {
      console.error('❌ Erro no teste de notificação:', error);
      this.showMessage('Erro no teste: ' + error.message, 'error');
    } finally {
      this.setLoading(false);
      this.elements.testNotification.textContent = '🧪 Testar';
    }
  }
  
  /**
   * Abre a interface de busca avançada
   */
  openSearch() {
    try {
      // Abre a interface de busca em uma nova aba
      chrome.tabs.create({
        url: chrome.runtime.getURL('search-interface.html')
      });
      
      console.log('🔍 Interface de busca aberta em nova aba');
      
    } catch (error) {
      console.error('❌ Erro ao abrir interface de busca:', error);
      this.showMessage('Erro ao abrir interface de busca: ' + error.message, 'error');
    }
  }
  
  /**
   * Abre o dashboard de analytics
   */
  openDashboard() {
    try {
      // Abre o dashboard em uma nova aba
      chrome.tabs.create({
        url: chrome.runtime.getURL('analytics-dashboard.html')
      });
      
      console.log('📊 Dashboard aberto em nova aba');
      
    } catch (error) {
      console.error('❌ Erro ao abrir dashboard:', error);
      this.showMessage('Erro ao abrir dashboard: ' + error.message, 'error');
    }
  }
  
  /**
   * Carrega contagem de favoritos
   */
  async loadFavoritesCount() {
    try {
      const response = await this.sendMessage('GET_FAVORITES_COUNT');
      
      if (response.success) {
        this.elements.favoritesCount.textContent = response.count;
      } else {
        this.elements.favoritesCount.textContent = '-';
      }
      
    } catch (error) {
      console.error('❌ Erro ao carregar contagem de favoritos:', error);
      this.elements.favoritesCount.textContent = '-';
    }
  }
  
  /**
   * Importa favoritos do navegador
   */
  async importFavorites() {
    try {
      this.setLoading(true);
      this.elements.importFavorites.textContent = '⏳ Importando...';
      this.elements.importFavorites.disabled = true;
      
      // Esconde status anterior
      this.elements.favoritesStatus.style.display = 'none';
      
      // Inicia importação
      const response = await this.sendMessage('IMPORT_FAVORITES');
      
      if (response.success) {
        const { imported, total, errors } = response.result;
        
        // Mostra status de sucesso
        this.elements.favoritesStatus.style.display = 'block';
        this.elements.favoritesStatus.className = 'favorites-status success';
        this.elements.favoritesStatusText.textContent = 
          `✅ ${imported} de ${total} favoritos importados com sucesso!`;
        
        if (errors > 0) {
          this.elements.favoritesStatusText.textContent += ` (${errors} erros)`;
        }
        
        // Atualiza contagem
        await this.loadFavoritesCount();
        
        // Atualiza estatísticas gerais
        await this.loadStatus();
        
        console.log('✅ Favoritos importados com sucesso:', response.result);
        
      } else {
        throw new Error(response.error || 'Erro ao importar favoritos');
      }
      
    } catch (error) {
      console.error('❌ Erro ao importar favoritos:', error);
      
      // Mostra status de erro
      this.elements.favoritesStatus.style.display = 'block';
      this.elements.favoritesStatus.className = 'favorites-status error';
      this.elements.favoritesStatusText.textContent = 
        '❌ Erro ao importar favoritos: ' + error.message;
      
    } finally {
      this.setLoading(false);
      this.elements.importFavorites.textContent = '📥 Importar Favoritos';
      this.elements.importFavorites.disabled = false;
      
      // Remove status após 5 segundos
      setTimeout(() => {
        if (this.elements.favoritesStatus.style.display !== 'none') {
          this.elements.favoritesStatus.style.display = 'none';
        }
      }, 5000);
    }
  }
  
  /**
   * Carrega configurações do botão flutuante
   */
  async loadFloatingCaptureSettings() {
    try {
      const response = await this.sendMessage('GET_FLOATING_CAPTURE_SETTINGS');
      
      if (response.success) {
        const settings = response.settings;
        
        // Atualiza checkboxes
        this.elements.floatingCaptureEnabled.checked = settings.enabled;
        this.elements.floatingCaptureAutoHide.checked = settings.autoHide;
        this.elements.floatingCaptureShowTitle.checked = settings.showTitle;
        
        console.log('🎯 Configurações do botão flutuante carregadas:', settings);
      }
      
    } catch (error) {
      console.error('❌ Erro ao carregar configurações do botão flutuante:', error);
    }
  }
  
  /**
   * Salva configurações do botão flutuante
   */
  async saveFloatingCaptureSettings() {
    try {
      this.setLoading(true);
      this.elements.saveFloatingCaptureSettings.textContent = '💾 Salvando...';
      
      const settings = {
        enabled: this.elements.floatingCaptureEnabled.checked,
        autoHide: this.elements.floatingCaptureAutoHide.checked,
        showTitle: this.elements.floatingCaptureShowTitle.checked
      };
      
      const response = await this.sendMessage('UPDATE_FLOATING_CAPTURE_SETTINGS', { settings });
      
      if (response.success) {
        console.log('✅ Configurações do botão flutuante salvas:', settings);
        this.showMessage('Configurações salvas com sucesso!', 'success');
      } else {
        throw new Error(response.error || 'Erro ao salvar configurações');
      }
      
    } catch (error) {
      console.error('❌ Erro ao salvar configurações do botão flutuante:', error);
      this.showMessage('Erro ao salvar configurações: ' + error.message, 'error');
    } finally {
      this.setLoading(false);
      this.elements.saveFloatingCaptureSettings.textContent = '💾 Salvar';
    }
  }
  
  /**
   * Testa o sistema de notificação de captura
   */
  async testFloatingCapture() {
    try {
      this.setLoading(true);
      this.elements.testFloatingCapture.textContent = '🧪 Testando...';
      
      // Envia comando para testar o sistema de notificação na aba atual
      const response = await this.sendMessage('TEST_FLOATING_CAPTURE');
      
      if (response.success) {
        console.log('✅ Teste do sistema de notificação bem-sucedido');
        this.showMessage('Sistema testado! Verifique a notificação na página atual.', 'success');
      } else {
        throw new Error(response.error || 'Erro no teste do sistema de notificação');
      }
      
    } catch (error) {
      console.error('❌ Erro no teste do sistema de notificação:', error);
      this.showMessage('Erro no teste: ' + error.message, 'error');
    } finally {
      this.setLoading(false);
      this.elements.testFloatingCapture.textContent = '🧪 Testar';
    }
  }
  
    /**
   * Testa o banco de dados
   */
  async testDatabase() {
    try {
      this.setLoading(true);
      this.elements.testDatabase.textContent = '🗄️ Testando...';

      // Envia comando para testar o banco de dados
      const response = await this.sendMessage('TEST_DATABASE');

      if (response.success) {
        console.log('✅ Teste do banco bem-sucedido:', response.result);
        this.showMessage(`Banco testado! Stores: ${response.result.stores.join(', ')}, Páginas: ${response.result.totalPages}`, 'success');
      } else {
        throw new Error(response.error || 'Erro no teste do banco');
      }

    } catch (error) {
      console.error('❌ Erro no teste do banco:', error);
      this.showMessage('Erro no teste: ' + error.message, 'error');
    } finally {
      this.setLoading(false);
      this.elements.testDatabase.textContent = '🗄️ Testar Banco';
    }
  }
  
  /**
   * Injeta o content script manualmente
   */
  async injectContentScript() {
    try {
      this.setLoading(true);
      this.elements.injectContentScript.textContent = '📜 Injetando...';

      // Envia comando para injetar o content script
      const response = await this.sendMessage('INJECT_CONTENT_SCRIPT');

      if (response.success) {
        console.log('✅ Content script injetado:', response.message);
        this.showMessage('Content script injetado com sucesso!', 'success');
        
        // Aguarda um pouco e testa a comunicação
        setTimeout(async () => {
          try {
            const testResponse = await this.sendMessage('TEST_DATABASE');
            if (testResponse.success) {
              this.showMessage('✅ Comunicação testada após injeção!', 'success');
            }
          } catch (error) {
            console.error('❌ Erro no teste após injeção:', error);
          }
        }, 2000);
        
      } else {
        throw new Error(response.error || 'Erro na injeção do content script');
      }

    } catch (error) {
      console.error('❌ Erro na injeção do content script:', error);
      this.showMessage('Erro na injeção: ' + error.message, 'error');
    } finally {
      this.setLoading(false);
      this.elements.injectContentScript.textContent = '📜 Injetar Script';
    }
  }

  /**
   * Abre a página de teste do botão flutuante
   */
  openTestPage() {
    try {
      // Abre a página de teste em uma nova aba
      chrome.tabs.create({
        url: chrome.runtime.getURL('test-floating.html')
      });
      
      console.log('📄 Página de teste aberta em nova aba');
      
    } catch (error) {
      console.error('❌ Erro ao abrir página de teste:', error);
      this.showMessage('Erro ao abrir página de teste: ' + error.message, 'error');
    }
  }
}

// Inicializa o popup quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  new BuscaLogoPopup();
});
