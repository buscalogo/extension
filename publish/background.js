/**
 * Background Script - BuscaLogo
 * 
 * Service Worker que gerencia:
 * - Coleta manual de dados das páginas
 * - Armazenamento local com IndexedDB
 * - Histórico de capturas
 * - Comunicação com content scripts
 * - Conexão com servidor central
 * - Resposta a queries de busca distribuída
 */

// BuscaLogo Background Script
// Gerencia coleta de dados, armazenamento IndexedDB e conexão com servidor central

console.log('🚀 BuscaLogo Background Script carregado');

class BuscaLogoBackground {
  constructor() {
    console.log('🏗️ Construtor BuscaLogoBackground chamado');
    this.db = null;
    this.peerId = null;
    this.stats = { totalPages: 0, uniqueHosts: new Set(), lastUpdated: Date.now() };
    this.captureHistory = [];
    this.serverConnection = null;
    this.isConnectedToServer = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.heartbeatInterval = null;
    this.heartbeatTimeout = null;
    this.captureQueue = []; // Fila de captura de artigos
    this.isProcessingQueue = false; // Flag para indicar se a fila está sendo processada
    this.currentPageUrl = ''; // URL da página atual para evitar captura dupla
    this.crawlingStats = {
      totalDiscovered: 0,
      totalCaptured: 0,
      totalFailed: 0
    };
    
    // Sistema de notificações
    this.notificationSettings = {
      enabled: true,
      newPageCaptured: true,
      crawlingProgress: true,
      connectionStatus: true,
      showBadge: true,
      showAlreadyCaptured: true  // Nova opção para mostrar aviso de página já capturada
    };
    this.notificationQueue = [];
    this.badgeCount = 0;
    
    // Configurações do botão flutuante
    this.floatingCaptureSettings = {
      enabled: true,
      autoHide: true,
      showTitle: true,
      hideDelay: 5000
    };
    
    console.log('✅ Construtor concluído');
    this.init();
  }
  
  /**
   * Inicializa o background script
   */
  async init() {
    console.log('🚀 Inicializando BuscaLogo Background...');
    await this.initStorage();
    console.log('💾 Storage inicializado');
    await this.loadSavedData();
    console.log('📚 Dados carregados');
          await this.loadNotificationSettings();
      console.log('🔔 Configurações de notificação carregadas');
      await this.loadFloatingCaptureSettings();
      console.log('🎯 Configurações do botão flutuante carregadas');
      await this.connectToServer();
    console.log('🔗 Tentativa de conexão com servidor iniciada');
    this.setupMessageHandlers();
    console.log('🎯 Handlers de mensagem configurados');
    
    // Inicia limpeza automática de notificações
    setInterval(() => this.clearOldNotifications(), 300000); // A cada 5 minutos
  }
  
  /**
   * Conecta ao servidor central
   */
  async connectToServer() {
    try {
      console.log('🔗 Tentando conectar ao servidor...');
      
      if (this.serverConnection) {
        console.log('🔄 Fechando conexão existente...');
        this.serverConnection.close();
      }
      
      // Gera ID único para este peer
      this.peerId = `extension_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      console.log('🆔 Peer ID gerado:', this.peerId);
      
      // Conecta ao servidor
      // const serverUrl = `ws://localhost:3001?peerId=${this.peerId}`;
      const serverUrl = `wss://api.buscalogo.com?peerId=${this.peerId}`;
      console.log('🌐 Conectando a:', serverUrl);
      
      this.serverConnection = new WebSocket(serverUrl);
      
      this.serverConnection.onopen = () => {
        console.log('🔗 Conectado ao servidor central');
        this.isConnectedToServer = true;
        this.reconnectAttempts = 0;
        
        // Inicia sistema de heartbeat
        this.startHeartbeat();
        
        // Notifica conexão bem-sucedida
        this.notifyConnectionStatus(true);
        
        // Envia mensagem de conexão
        this.sendToServer({
          type: 'PEER_CONNECT',
          peerId: this.peerId,
          capabilities: {
            search: true,
            storage: true
          },
          timestamp: Date.now()
        });
      };
      
      this.serverConnection.onmessage = (event) => {
        console.log('📨 Mensagem recebida do servidor:', event.data);
        this.handleServerMessage(event.data);
      };
      
      this.serverConnection.onclose = () => {
        console.log('🔌 Desconectado do servidor central');
        this.isConnectedToServer = false;
        this.stopHeartbeat();
        
        // Notifica desconexão
        this.notifyConnectionStatus(false);
        
        this.handleServerDisconnection();
      };
      
      this.serverConnection.onerror = (error) => {
        console.error('❌ Erro na conexão com servidor:', error);
        this.isConnectedToServer = false;
        this.stopHeartbeat();
      };
      
    } catch (error) {
      console.error('❌ Erro ao conectar ao servidor:', error);
      this.scheduleReconnect();
    }
  }
  
  /**
   * Agenda reconexão ao servidor
   */
  scheduleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      const delay = Math.min(1000 * Math.pow(2, this.reconnectAttempts), 30000); // Exponential backoff
      
      console.log(`🔄 Tentativa de reconexão ${this.reconnectAttempts}/${this.maxReconnectAttempts} em ${delay}ms`);
      
      setTimeout(() => {
        this.connectToServer();
      }, delay);
    } else {
      console.error('❌ Máximo de tentativas de reconexão atingido');
    }
  }
  
  /**
   * Gerencia desconexão do servidor
   */
  handleServerDisconnection() {
    if (this.isConnectedToServer) {
      this.scheduleReconnect();
    }
  }
  
  /**
   * Envia mensagem para o servidor
   */
  sendToServer(message) {
    if (this.serverConnection && this.serverConnection.readyState === WebSocket.OPEN) {
      try {
        this.serverConnection.send(JSON.stringify(message));
      } catch (error) {
        console.error('❌ Erro ao enviar mensagem para servidor:', error);
      }
    } else {
      console.warn('⚠️ Servidor não conectado, mensagem não enviada');
    }
  }
  
  /**
   * Processa mensagens do servidor
   */
  handleServerMessage(data) {
    try {
      const message = JSON.parse(data);
      console.log('📨 Mensagem recebida do servidor:', message);
      
      const { type, queryId, query, timestamp } = message;
      
      switch (type) {
        case 'WELCOME':
          console.log('👋 Servidor enviou boas-vindas:', message.message);
          break;
          
        case 'CONNECTION_ESTABLISHED':
          console.log('✅ Conexão com servidor estabelecida');
          break;
          
        case 'SEARCH_REQUEST':
          console.log('🔍 SEARCH_REQUEST recebido:', { queryId, query, timestamp });
          this.handleServerSearchRequest(queryId, query);
          break;
          
        case 'PONG':
          // Resposta a ping, mantém conexão ativa
          console.log('🏓 PONG recebido, conexão ativa');
          if (this.heartbeatTimeout) {
            clearTimeout(this.heartbeatTimeout);
            this.heartbeatTimeout = null;
          }
          break;
          
        default:
          console.log('📨 Mensagem do servidor:', type, message);
      }
      
    } catch (error) {
      console.error('❌ Erro ao processar mensagem do servidor:', error);
    }
  }
  
  /**
   * Processa requisição de busca do servidor
   */
  async handleServerSearchRequest(queryId, query) {
    try {
      console.log(`🔍 handleServerSearchRequest chamado com:`, { queryId, query });
      console.log(`🔍 Tipos: queryId = ${typeof queryId}, query = ${typeof query}`);
      
      // Verifica se os parâmetros são válidos
      if (!queryId || !query) {
        console.error('❌ Parâmetros inválidos:', { queryId, query });
        return;
      }
      
      console.log(`🔍 Busca solicitada pelo servidor: "${query}" (${queryId})`);
      
      // Busca local no IndexedDB
      const localResults = await this.searchLocalPages(query);
      console.log(`✅ Busca local concluída, ${localResults.length} resultados`);
      
      // Envia resultados para o servidor
      const response = {
        type: 'SEARCH_RESPONSE',
        queryId: queryId,
        results: localResults,
        peerId: this.peerId,
        timestamp: Date.now()
      };
      
      console.log(`📤 Enviando resposta para o servidor:`, response);
      this.sendToServer(response);
      
      console.log(`📤 Enviados ${localResults.length} resultados para query ${queryId}`);
      
    } catch (error) {
      console.error('❌ Erro ao processar busca do servidor:', error);
      
      // Envia erro para o servidor
      const errorResponse = {
        type: 'SEARCH_RESPONSE',
        queryId: queryId,
        error: error.message,
        peerId: this.peerId,
        timestamp: Date.now()
      };
      
      this.sendToServer(errorResponse);
    }
  }
  
  /**
   * Inicializa o IndexedDB
   */
  async initStorage() {
    try {
      console.log('🗄️ Inicializando IndexedDB...');
      
      const request = indexedDB.open('BuscaLogoDB', 1);
      
      request.onerror = (event) => {
        console.error('❌ Erro ao abrir IndexedDB:', event.target.error);
      };
      
      request.onsuccess = (event) => {
        this.db = event.target.result;
        console.log('✅ IndexedDB aberto com sucesso');
        console.log('✅ Stores disponíveis:', this.db.objectStoreNames);
        
        // Carrega dados salvos
        this.loadSavedData();
      };
      
      request.onupgradeneeded = (event) => {
        console.log('🔄 Atualizando schema do IndexedDB...');
        const db = event.target.result;
        
        // Store para páginas capturadas
        if (!db.objectStoreNames.contains('capturedPages')) {
          const pagesStore = db.createObjectStore('capturedPages', { keyPath: 'url' });
          pagesStore.createIndex('title', 'title', { unique: false });
          pagesStore.createIndex('hostname', 'hostname', { unique: false });
          pagesStore.createIndex('timestamp', 'timestamp', { unique: false });
          console.log('✅ Store capturedPages criada');
        }
        
        // Store para histórico
        if (!db.objectStoreNames.contains('captureHistory')) {
          const historyStore = db.createObjectStore('captureHistory', { keyPath: 'timestamp' });
          historyStore.createIndex('url', 'url', { unique: false });
          historyStore.createIndex('hostname', 'hostname', { unique: false });
          historyStore.createIndex('timestamp', 'timestamp', { unique: false });
          console.log('✅ Store captureHistory criada');
        }
        
        // Store para indexação de links
        if (!db.objectStoreNames.contains('linkIndex')) {
          const linkStore = db.createObjectStore('linkIndex', { keyPath: 'url' });
          linkStore.createIndex('text', 'text', { unique: false });
          linkStore.createIndex('title', 'title', { unique: false });
          linkStore.createIndex('type', 'type', { unique: false });
          linkStore.createIndex('relevance', 'relevance', { unique: false });
          linkStore.createIndex('sourceUrl', 'sourceUrl', { unique: false });
          linkStore.createIndex('sourceHostname', 'sourceHostname', { unique: false });
          linkStore.createIndex('discoveredAt', 'discoveredAt', { unique: false });
          linkStore.createIndex('lastSeen', 'lastSeen', { unique: false });
          linkStore.createIndex('clickCount', 'clickCount', { unique: false });
          console.log('✅ Store linkIndex criada');
        }
        
        // Store para análise de conteúdo
        if (!db.objectStoreNames.contains('contentAnalysis')) {
          const contentStore = db.createObjectStore('contentAnalysis', { keyPath: 'url' });
          contentStore.createIndex('contentType', 'contentType', { unique: false });
          contentStore.createIndex('topics', 'topics', { unique: false });
          contentStore.createIndex('entities', 'entities', { unique: false });
          contentStore.createIndex('sentiment', 'sentiment', { unique: false });
          contentStore.createIndex('readingLevel', 'readingLevel', { unique: false });
          contentStore.createIndex('contentStructure', 'contentStructure', { unique: false });
          contentStore.createIndex('analyzedAt', 'analyzedAt', { unique: false });
          console.log('✅ Store contentAnalysis criada');
        }
        
        // Store para fila de captura persistente
        if (!db.objectStoreNames.contains('captureQueue')) {
          const queueStore = db.createObjectStore('captureQueue', { keyPath: 'id' });
          queueStore.createIndex('url', 'url', { unique: false });
          queueStore.createIndex('priority', 'priority', { unique: false });
          queueStore.createIndex('scheduledAt', 'scheduledAt', { unique: false });
          queueStore.createIndex('status', 'status', { unique: false });
          console.log('✅ Store captureQueue criada');
        }
        
        console.log('🔄 Schema do IndexedDB atualizado');
      };
      
    } catch (error) {
      console.error('❌ Erro ao inicializar IndexedDB:', error);
    }
  }
  
  /**
   * Carrega dados salvos do IndexedDB
   */
  async loadSavedData() {
    try {
      if (!this.db) return;
      
      // Carrega páginas capturadas
      const pagesTransaction = this.db.transaction(['capturedPages'], 'readonly');
      const pagesStore = pagesTransaction.objectStore('capturedPages');
      const pagesRequest = pagesStore.getAll();
      
      pagesRequest.onsuccess = () => {
        const pages = pagesRequest.result || [];
        this.stats.totalPages = pages.length;
        console.log(`📊 ${pages.length} páginas carregadas do IndexedDB`);
      };
      
      // Carrega histórico
      const historyTransaction = this.db.transaction(['captureHistory'], 'readonly');
      const historyStore = historyTransaction.objectStore('captureHistory');
      const historyRequest = historyStore.getAll();
      
      historyRequest.onsuccess = () => {
        this.captureHistory = historyRequest.result || [];
        console.log(`📚 ${this.captureHistory.length} entradas no histórico carregadas`);
      };
      
      // Carrega fila de captura persistente
      await this.loadPersistentQueue();
      
      // Limpa tarefas antigas
      await this.cleanupOldTasks();
      
    } catch (error) {
      console.error('❌ Erro ao carregar dados salvos:', error);
    }
  }
  
  /**
   * Carrega fila de captura persistente
   */
  async loadPersistentQueue() {
    try {
      if (!this.db) return;
      
      const transaction = this.db.transaction(['captureQueue'], 'readonly');
      const store = transaction.objectStore('captureQueue');
      const request = store.getAll();
      
      request.onsuccess = () => {
        const savedTasks = request.result || [];
        console.log(`📋 ${savedTasks.length} tarefas encontradas na fila persistente`);
        
        // Filtra apenas tarefas pendentes
        const pendingTasks = savedTasks.filter(task => 
          task.status === 'pending' || task.status === 'processing'
        );
        
        if (pendingTasks.length > 0) {
          console.log(`🔄 ${pendingTasks.length} tarefas pendentes serão retomadas`);
          
          // Adiciona à fila em memória
          this.captureQueue = pendingTasks;
          
          // Atualiza estatísticas
          this.crawlingStats.totalDiscovered = pendingTasks.length;
          
          // Inicia processamento se não estiver rodando
          if (!this.isProcessingQueue) {
            console.log('🚀 Retomando processamento da fila persistente...');
            this.processCaptureQueue();
          }
        } else {
          console.log('✅ Nenhuma tarefa pendente para retomar');
        }
      };
      
    } catch (error) {
      console.error('❌ Erro ao carregar fila persistente:', error);
    }
  }
  
  /**
   * Configura handlers de mensagens do Chrome
   */
  setupMessageHandlers() {
    console.log('🎯 Configurando handlers de mensagens...');
    
    // Verifica se chrome.runtime está disponível
    if (!chrome.runtime) {
      console.error('❌ chrome.runtime não está disponível');
      return;
    }
    
    if (!chrome.runtime.onMessage) {
      console.error('❌ chrome.runtime.onMessage não está disponível');
      return;
    }
    
    console.log('✅ chrome.runtime.onMessage disponível, registrando listener...');
    
    // Usa arrow function para manter o contexto 'this'
    const messageHandler = (message, sender, sendResponse) => {
      console.log('📨 Mensagem recebida no background:', message);
      this.handleChromeMessage(message, sender, sendResponse);
      return true; // Mantém a conexão aberta para resposta assíncrona
    };
    
    chrome.runtime.onMessage.addListener(messageHandler);
    
    console.log('✅ Listener registrado com sucesso');
    
    // Teste: verifica se o listener foi registrado
    console.log('🧪 Verificando se o listener foi registrado...');
    console.log('🧪 chrome.runtime.onMessage.hasListeners():', chrome.runtime.onMessage.hasListeners());
    
    // Teste: envia uma mensagem de teste para verificar se está funcionando
    setTimeout(() => {
      console.log('🧪 Testando listener com mensagem de teste...');
      chrome.runtime.sendMessage({ type: 'TEST', data: 'teste' }, (response) => {
        console.log('🧪 Resposta do teste:', response);
      });
    }, 1000);
  }
  
  /**
   * Processa mensagens do Chrome
   */
  async handleChromeMessage(message, sender, sendResponse) {
    console.log('📨 Mensagem recebida:', message);
    
    try {
      switch (message.type) {
        case 'CAPTURE_CURRENT_PAGE':
          console.log('📸 Capturando página atual...');
          this.handleCaptureCurrentPage().then(() => {
            sendResponse({ success: true, message: 'Página capturada com sucesso' });
          }).catch(error => {
            sendResponse({ success: false, error: error.message });
          });
          return true; // Indica que a resposta será assíncrona
          
        case 'CHECK_PAGE_CAPTURED':
          console.log('🔍 Verificando se página já foi capturada...');
          try {
            // Verifica se a URL é válida
            if (!message.data?.url || message.data.url.length === 0) {
              console.error('🔍 BuscaLogo: URL inválida recebida, retornando false');
              sendResponse({ success: true, isCaptured: false });
              return true;
            }
            
            const isCaptured = await this.checkPageCaptured(message.data.url);
            console.log('🔍 BuscaLogo: Resultado da verificação:', isCaptured);
            
            const response = { 
              success: true, 
              isCaptured,
              showAlreadyCaptured: this.notificationSettings.showAlreadyCaptured
            };
            console.log('🔍 BuscaLogo: Enviando resposta:', response);
            sendResponse(response);
          } catch (error) {
            console.error('🔍 BuscaLogo: Erro ao verificar página:', error);
            sendResponse({ success: false, error: error.message });
          }
          return true;
          
        case 'GET_CAPTURE_HISTORY':
          console.log('📚 Obtendo histórico de capturas...');
          this.getCaptureHistory().then(history => {
            sendResponse({ success: true, history: history });
          }).catch(error => {
            sendResponse({ success: false, error: error.message });
          });
          return true;
          
        case 'GET_STATS':
          console.log('📊 Obtendo estatísticas...');
          sendResponse({ success: true, stats: this.getStats() });
          break;
          
        case 'GET_STATUS':
          console.log('📋 Obtendo status...');
          sendResponse({ success: true, status: this.getStatus() });
          break;
          
        case 'CLEAR_DATA':
          console.log('🗑️ Limpando dados...');
          this.clearData().then(() => {
            sendResponse({ success: true, message: 'Dados limpos com sucesso' });
          }).catch(error => {
            sendResponse({ success: false, error: error.message });
          });
          return true;
          
        case 'SEARCH_REQUEST':
          console.log('🔍 Busca local solicitada...');
          this.handleSearchRequest(message).then(result => {
            sendResponse({ success: true, results: result });
          }).catch(error => {
            sendResponse({ success: false, error: error.message });
          });
          return true;
          
        case 'GET_NOTIFICATION_SETTINGS':
          console.log('🔔 Obtendo configurações de notificação...');
          sendResponse({ success: true, settings: this.notificationSettings });
          break;
          
        case 'UPDATE_NOTIFICATION_SETTINGS':
          console.log('🔔 Atualizando configurações de notificação...');
          this.notificationSettings = { ...this.notificationSettings, ...message.data.settings };
          await this.saveNotificationSettings();
          sendResponse({ success: true, settings: this.notificationSettings });
          return true;
          
        case 'TEST_NOTIFICATION':
          console.log('🔔 Testando notificação...');
          await this.createNotification({
            title: '🧪 Notificação de Teste',
            message: 'Sistema de notificações funcionando perfeitamente!',
            contextMessage: 'BuscaLogo'
          });
          sendResponse({ success: true, message: 'Notificação de teste enviada' });
          return true;
          
        case 'GET_ANALYTICS_DATA':
          console.log('📊 Obtendo dados de analytics...');
          const analyticsData = await this.getAnalyticsData();
          sendResponse({ success: true, data: analyticsData });
          return true;
          
        case 'EXPORT_ANALYTICS_DATA':
          console.log('📤 Exportando dados de analytics...');
          const exportData = await this.exportAnalyticsData();
          sendResponse({ success: true, data: exportData });
          return true;
          
        case 'GET_ALL_PAGES':
          console.log('📄 Obtendo todas as páginas...');
          const allPages = await this.getAllPagesData();
          sendResponse({ success: true, pages: allPages });
          return true;
          
        case 'GET_FAVORITES_COUNT':
          console.log('⭐ Obtendo contagem de favoritos...');
          const favoritesCount = await this.getFavoritesCount();
          sendResponse({ success: true, count: favoritesCount });
          return true;
          
        case 'IMPORT_FAVORITES':
          console.log('📥 Importando favoritos...');
          const importResult = await this.importFavorites();
          sendResponse({ success: true, result: importResult });
          return true;
          
        case 'GET_FLOATING_CAPTURE_SETTINGS':
          console.log('🎯 Obtendo configurações do botão flutuante...');
          sendResponse({ success: true, settings: this.floatingCaptureSettings });
          break;
          
        case 'UPDATE_FLOATING_CAPTURE_SETTINGS':
          console.log('🎯 Atualizando configurações do botão flutuante...');
          this.floatingCaptureSettings = { ...this.floatingCaptureSettings, ...message.data.settings };
          await this.saveFloatingCaptureSettings();
          sendResponse({ success: true, settings: this.floatingCaptureSettings });
          return true;
          
                        case 'TEST_FLOATING_CAPTURE':
                  console.log('🧪 Testando sistema de notificação...');
                  await this.testFloatingCapture();
                  sendResponse({ success: true, message: 'Teste do sistema de notificação iniciado' });
                  return true;

                        case 'TEST_DATABASE':
          console.log('🧪 Testando banco de dados...');
          try {
            const testResult = await this.testDatabase();
            sendResponse({ success: true, result: testResult });
          } catch (error) {
            sendResponse({ success: false, error: error.message });
          }
          return true;
          
        case 'INJECT_CONTENT_SCRIPT':
          console.log('🧪 Injetando content script...');
          try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tab) {
              await chrome.scripting.executeScript({
                target: { tabId: tab.id },
                files: ['content.js']
              });
              sendResponse({ success: true, message: 'Content script injetado' });
            } else {
              sendResponse({ success: false, error: 'Nenhuma aba ativa encontrada' });
            }
          } catch (error) {
            sendResponse({ success: false, error: error.message });
          }
          return true;



                case 'CAPTURE_CURRENT_PAGE':
                  console.log('📥 Capturando página atual:', message.data.url);
                  const captureResult = await this.captureCurrentPage(message.data);
                  sendResponse({ success: true, result: captureResult });
                  return true;
          
        default:
          console.warn('⚠️ Tipo de mensagem desconhecido:', message.type);
          sendResponse({ success: false, error: 'Tipo de mensagem desconhecido' });
          break;
      }
    } catch (error) {
      console.error('❌ Erro ao processar mensagem:', error);
      sendResponse({ success: false, error: error.message });
    }
  }
  
  /**
   * Captura dados da página atual
   */
  async handleCaptureCurrentPage() {
    try {
      console.log('📝 Iniciando captura da página atual...');
      
      // Obtém a aba ativa
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab) {
        console.error('❌ Nenhuma aba ativa encontrada');
        return;
      }
      
      // Define a URL atual para o crawling
      this.currentPageUrl = tab.url;
      console.log(`📍 Página atual definida: ${this.currentPageUrl}`);
      
      // Executa o script de coleta na aba ativa
      console.log('🚀 Executando script de coleta...');
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => {
          // Função inline para coletar dados da página
          try {
            const pageData = {
              meta: {},
              headings: [],
              paragraphs: [],
              lists: [],
              links: [],
              contentAnalysis: {},
              terms: []
            };
            
            // Extrai metadados
            const metaTags = document.querySelectorAll('meta');
            metaTags.forEach(tag => {
              const name = tag.getAttribute('name') || tag.getAttribute('property');
              const content = tag.getAttribute('content');
              if (name && content) {
                pageData.meta[name] = content;
              }
            });
            
            // Extrai headings
            const headingElements = document.querySelectorAll('h1, h2, h3');
            headingElements.forEach(h => {
              const text = h.textContent?.trim();
              if (text && text.length > 0) {
                pageData.headings.push({
                  level: parseInt(h.tagName.charAt(1)),
                  text: text
                });
              }
            });
            
            // Extrai parágrafos
            const pElements = document.querySelectorAll('p');
            pElements.forEach(p => {
              const text = p.textContent?.trim();
              if (text && text.length > 10) {
                pageData.paragraphs.push(text);
              }
            });
            
            // Extrai listas
            const listElements = document.querySelectorAll('ul, ol');
            listElements.forEach(list => {
              const items = [];
              const liElements = list.querySelectorAll('li');
              liElements.forEach(li => {
                const text = li.textContent?.trim();
                if (text && text.length > 0) {
                  items.push(text);
                }
              });
              if (items.length > 0) {
                pageData.lists.push({
                  type: list.tagName.toLowerCase(),
                  items: items
                });
              }
            });
            
            // Extrai links
            const linkElements = document.querySelectorAll('a[href]');
            linkElements.forEach(link => {
              const href = link.getAttribute('href');
              const text = link.textContent?.trim();
              const title = link.getAttribute('title');
              const rel = link.getAttribute('rel');
              
              if (href && text && text.length > 0) {
                // Classifica o link
                let type = 'general';
                let relevance = 0.5;
                const textLower = text.toLowerCase();
                
                if (textLower.includes('lançado') || textLower.includes('lançada') || 
                    textLower.includes('como instalar') || textLower.includes('tutorial') ||
                    textLower.includes('dica') || textLower.includes('guia')) {
                  type = 'article';
                  relevance = 0.8;
                }
                
                pageData.links.push({
                  url: href,
                  text: text,
                  title: title || '',
                  rel: rel || '',
                  type: type,
                  relevance: relevance
                });
              }
            });
            
            // Gera termos de busca
            const allText = [
              document.title,
              ...pageData.headings.map(h => h.text),
              ...pageData.paragraphs
            ].join(' ').toLowerCase();
            
            const words = allText.match(/\b\w{4,}\b/g) || [];
            const uniqueWords = [...new Set(words)];
            const commonWords = ['para', 'com', 'uma', 'este', 'essa', 'isso', 'aqui', 'onde', 'quando', 'como', 'porque'];
            pageData.terms = uniqueWords.filter(word => 
              !commonWords.includes(word) && word.length > 3
            ).slice(0, 20);
            
            console.log('🔍 BuscaLogo: Dados da página coletados manualmente');
            return pageData;
            
          } catch (error) {
            console.error('❌ BuscaLogo: Erro ao coletar dados da página:', error);
            return null;
          }
        }
      });
      
      if (!results || !results[0] || !results[0].result) {
        console.error('❌ Falha ao executar script de coleta');
        return;
      }
      
      const pageData = results[0].result;
      if (!pageData) {
        console.error('❌ Nenhum dado coletado da página');
        return;
      }
      
      console.log('📊 Dados coletados:', pageData);
      
      // Adiciona metadados
      pageData.url = tab.url;
      pageData.title = tab.title;
      pageData.hostname = new URL(tab.url).hostname;
      pageData.timestamp = Date.now();
      pageData.capturedBy = 'manual';
      
      // Processa links para indexação
      if (pageData.links && pageData.links.length > 0) {
        console.log(`🔗 Processando ${pageData.links.length} links para indexação`);
        console.log('📋 Links encontrados:', pageData.links.map(l => ({ text: l.text, type: l.type, relevance: l.relevance })));
        
        await this.processLinksForIndexing(pageData.links, pageData.hostname);
        
        // Inicia crawling automático para links de artigos
        console.log('🕷️ Iniciando processo de crawling...');
        await this.startArticleCrawling(pageData.links, pageData.hostname);
      } else {
        console.log('⚠️ Nenhum link encontrado na página');
      }
      
      // Salva dados da página
      await this.savePageData(pageData);
      
      // Adiciona ao histórico
      await this.addToHistory({
        url: tab.url,
        title: tab.title,
        hostname: new URL(tab.url).hostname,
        timestamp: Date.now(),
        capturedBy: 'manual'
      });
      
      // Atualiza estatísticas
      this.updateStats();
      
      // Notifica nova página capturada
      await this.notifyNewPageCaptured(pageData);
      
      console.log('✅ Página capturada com sucesso!');
      
    } catch (error) {
      console.error('❌ Erro ao capturar página:', error);
    }
  }
  
  /**
   * Função executada no content script para coletar dados
   * Esta função é definida como propriedade da classe para manter o contexto
   */
  get collectPageDataFunction() {
    return () => {
      console.log('🔍 Content script executando coleta de dados...');
      
      try {
        const pageData = {
          meta: {},
          headings: [],
          paragraphs: [],
          lists: [],
          terms: []
        };
        
        console.log('📄 Iniciando extração de dados...');
        
        // Extrai metadados
        const metaTags = document.querySelectorAll('meta');
        console.log(`📋 Encontrados ${metaTags.length} meta tags`);
        metaTags.forEach(tag => {
          const name = tag.getAttribute('name') || tag.getAttribute('property');
          const content = tag.getAttribute('content');
          if (name && content) {
            pageData.meta[name] = content;
          }
        });
        
        // Extrai headings
        const headingElements = document.querySelectorAll('h1, h2, h3');
        console.log(`📝 Encontrados ${headingElements.length} headings`);
        headingElements.forEach(heading => {
          const text = heading.textContent?.trim();
          if (text && text.length > 0) {
            pageData.headings.push({
              level: heading.tagName.toLowerCase(),
              text: text
            });
          }
        });
        
        // Extrai parágrafos
        const pElements = document.querySelectorAll('p');
        console.log(`📄 Encontrados ${pElements.length} parágrafos`);
        pElements.forEach(p => {
          const text = p.textContent?.trim();
          if (text && text.length > 10) {
            pageData.paragraphs.push(text);
          }
        });
        
        // Extrai listas
        const listElements = document.querySelectorAll('ul, ol');
        console.log(`📋 Encontradas ${listElements.length} listas`);
        listElements.forEach(list => {
          const items = [];
          const listItems = list.querySelectorAll('li');
          listItems.forEach(item => {
            const text = item.textContent?.trim();
            if (text && text.length > 0) {
              items.push(text);
            }
          });
          if (items.length > 0) {
            pageData.lists.push({
              type: list.tagName.toLowerCase(),
              items: items
            });
          }
        });
        
        // Gera termos de busca
        console.log('🔍 Gerando termos de busca...');
        const allText = [
          document.title,
          pageData.meta.description || '',
          ...pageData.headings.map(h => h.text),
          ...pageData.paragraphs,
          ...pageData.lists.flatMap(list => list.items)
        ].join(' ').toLowerCase();
        
        const cleanText = allText
          .replace(/<[^>]*>/g, ' ')
          .replace(/[^\w\s]/g, ' ')
          .replace(/\s+/g, ' ')
          .trim();
        
        const words = cleanText.split(/\s+/)
          .filter(word => word.length > 3)
          .filter(word => {
            // Lista de palavras comuns em português
            const commonWords = [
              'para', 'com', 'uma', 'por', 'mais', 'como', 'mas', 'foi', 'ele', 'se',
              'tem', 'à', 'seu', 'sua', 'ou', 'ser', 'quando', 'muito', 'há', 'nos',
              'já', 'está', 'eu', 'também', 'só', 'pelo', 'pela', 'até', 'isso', 'ela',
              'entre', 'era', 'depois', 'sem', 'mesmo', 'aos', 'ter', 'seus', 'suas'
            ];
            return !commonWords.includes(word.toLowerCase());
          });
        
        pageData.terms = [...new Set(words)].slice(0, 50);
        console.log(`🔤 Gerados ${pageData.terms.length} termos únicos`);
        
        console.log('✅ Coleta de dados concluída:', pageData);
        return pageData;
        
      } catch (error) {
        console.error('❌ Erro ao coletar dados da página:', error);
        return null;
      }
    };
  }
  
  /**
   * Verifica se uma palavra é comum
   */
  isCommonWord(word) {
    const commonWords = [
      'para', 'com', 'uma', 'por', 'mais', 'como', 'mas', 'foi', 'ele', 'se',
      'tem', 'à', 'seu', 'sua', 'ou', 'ser', 'quando', 'muito', 'há', 'nos'
    ];
    return commonWords.includes(word);
  }
  


  /**
   * Verifica se uma página já foi capturada (para crawling)
   */
  async checkIfPageAlreadyCaptured(url) {
    try {
      if (!this.db) return false;
      
      const transaction = this.db.transaction(['capturedPages'], 'readonly');
      const store = transaction.objectStore('capturedPages');
      const request = store.get(url);
      
      return new Promise((resolve) => {
        request.onsuccess = () => {
          resolve(!!request.result);
        };
        request.onerror = () => {
          resolve(false);
        };
      });
      
    } catch (error) {
      console.error('❌ Erro ao verificar página capturada para crawling:', error);
      return false;
    }
  }
  
  /**
   * Salva dados da página no IndexedDB
   */
  async savePageData(pageData) {
    try {
      if (!this.db) return;
      
      const transaction = this.db.transaction(['capturedPages'], 'readwrite');
      const store = transaction.objectStore('capturedPages');
      
      await store.put(pageData);
      console.log(`💾 Página salva no IndexedDB: ${pageData.title}`);
      
    } catch (error) {
      console.error('❌ Erro ao salvar página:', error);
    }
  }
  
  /**
   * Adiciona página ao histórico
   */
  async addToHistory(pageData) {
    try {
      if (!this.db) return;
      
      const transaction = this.db.transaction(['captureHistory'], 'readwrite');
      const store = transaction.objectStore('captureHistory');
      
      const historyEntry = {
        url: pageData.url,
        title: pageData.title,
        hostname: pageData.hostname,
        timestamp: pageData.timestamp,
        capturedBy: pageData.capturedBy || 'manual'
      };
      
      await store.add(historyEntry);
      this.captureHistory.push(historyEntry);
      
      console.log(`📚 Página adicionada ao histórico: ${pageData.title}`);
      
    } catch (error) {
      console.error('❌ Erro ao adicionar ao histórico:', error);
    }
  }
  
  /**
   * Obtém histórico de capturas
   */
  async getCaptureHistory() {
    try {
      if (!this.db) return this.captureHistory;
      
      const transaction = this.db.transaction(['captureHistory'], 'readonly');
      const store = transaction.objectStore('captureHistory');
      const index = store.index('timestamp');
      const request = index.openCursor(null, 'prev'); // Ordem decrescente
      
      const history = [];
      
      return new Promise((resolve) => {
        request.onsuccess = (event) => {
          const cursor = event.target.result;
          if (cursor) {
            history.push(cursor.value);
            cursor.continue();
          } else {
            resolve(history.slice(0, 50)); // Limita a 50 entradas
          }
        };
        request.onerror = () => resolve(this.captureHistory);
      });
      
    } catch (error) {
      console.error('❌ Erro ao obter histórico:', error);
      return this.captureHistory;
    }
  }
  
  /**
   * Atualiza estatísticas da extensão
   */
  updateStats() {
    try {
      if (this.stats) {
        this.stats.totalPages = (this.stats.totalPages || 0) + 1;
        this.stats.lastUpdated = Date.now();
        console.log(`📊 Estatísticas atualizadas: ${this.stats.totalPages} páginas`);
      }
    } catch (error) {
      console.error('❌ Erro ao atualizar estatísticas:', error);
    }
  }
  
  /**
   * Processa busca local solicitada pelo popup
   */
  async handleSearchRequest(message) {
    try {
      const { query } = message;
      if (!query) {
        throw new Error('Query não fornecida');
      }
      
      console.log(`🔍 Busca local por: "${query}"`);
      const results = await this.searchLocalPages(query);
      
      return {
        total: results.length,
        results: results
      };
      
    } catch (error) {
      console.error('❌ Erro na busca local:', error);
      throw error;
    }
  }
  
  /**
   * Busca páginas localmente no IndexedDB
   */
  async searchLocalPages(query) {
    try {
      if (!this.db || !query) return [];
      
      console.log(`🔍 Buscando por "${query}" no IndexedDB...`);
      
      const transaction = this.db.transaction(['capturedPages'], 'readonly');
      const store = transaction.objectStore('capturedPages');
      const request = store.getAll();
      
      return new Promise((resolve) => {
        request.onsuccess = () => {
          const pages = request.result || [];
          console.log(`📊 ${pages.length} páginas encontradas no IndexedDB`);
          
          if (pages.length === 0) {
            resolve([]);
            return;
          }
          
          // Filtra e pontua resultados
          const results = pages
            .map(page => {
              const score = this.calculateSearchScore(page, query);
              return { ...page, score };
            })
            .filter(result => result.score > 0)
            .sort((a, b) => b.score - a.score);
          
          console.log(`✅ ${results.length} resultados relevantes encontrados`);
          resolve(results);
        };
        
        request.onerror = () => {
          console.error('❌ Erro ao buscar no IndexedDB');
          resolve([]);
        };
      });
      
    } catch (error) {
      console.error('❌ Erro na busca local:', error);
      return [];
    }
  }
  
  /**
   * Calcula score de relevância para busca
   */
  calculateSearchScore(page, query) {
    if (!page || !query) return 0;
    
    const queryLower = query.toLowerCase();
    let score = 0;
    
    // Título (maior peso)
    if (page.title && typeof page.title === 'string') {
      const titleLower = page.title.toLowerCase();
      if (titleLower.includes(queryLower)) score += 10;
      if (titleLower.startsWith(queryLower)) score += 5;
    }
    
    // Meta description
    if (page.meta && page.meta.description) {
      const descLower = page.meta.description.toLowerCase();
      if (descLower.includes(queryLower)) score += 8;
    }
    
    // Headings
    if (page.headings && Array.isArray(page.headings)) {
      page.headings.forEach(heading => {
        if (heading.text && typeof heading.text === 'string') {
          const headingLower = heading.text.toLowerCase();
          if (headingLower.includes(queryLower)) score += 6;
        }
      });
    }
    
    // Parágrafos
    if (page.paragraphs && Array.isArray(page.paragraphs)) {
      page.paragraphs.forEach(paragraph => {
        if (paragraph && typeof paragraph === 'string') {
          const paraLower = paragraph.toLowerCase();
          if (paraLower.includes(queryLower)) score += 3;
        }
      });
    }
    
    // Termos de busca
    if (page.terms && Array.isArray(page.terms)) {
      page.terms.forEach(term => {
        if (term && typeof term === 'string') {
          const termLower = term.toLowerCase();
          if (termLower.includes(queryLower)) score += 4;
        }
      });
    }
    
    return score;
  }
  
  /**
   * Retorna estatísticas da extensão
   */
  getStats() {
    return {
      totalPages: this.stats?.totalPages || 0,
      uniqueHosts: this.stats?.uniqueHosts?.size || 0,
      lastUpdated: this.stats?.lastUpdated || 0,
      captureHistory: this.captureHistory?.length || 0
    };
  }
  
  /**
   * Retorna status atual da extensão
   */
  getStatus() {
    const serverStatus = this.isConnectedToServer && this.serverConnection && 
                        this.serverConnection.readyState === WebSocket.OPEN ? 'Conectado' : 'Desconectado';
    
    return {
      isConnectedToServer: this.isConnectedToServer,
      peerId: this.peerId || 'Não definido',
      serverConnection: serverStatus,
      stats: this.stats,
      isCrawling: this.isProcessingQueue,
      queueSize: this.captureQueue ? this.captureQueue.length : 0,
      currentPageUrl: this.currentPageUrl,
      crawlingStats: {
        totalDiscovered: this.crawlingStats?.totalDiscovered || 0,
        totalCaptured: this.crawlingStats?.totalCaptured || 0,
        totalFailed: this.crawlingStats?.totalFailed || 0,
        isActive: this.isProcessingQueue,
        queueSize: this.captureQueue ? this.captureQueue.length : 0
      }
    };
  }
  
  /**
   * Limpa todos os dados salvos
   */
  async clearData() {
    try {
      if (!this.db) return;
      
      // Limpa páginas capturadas
      const pagesTransaction = this.db.transaction(['capturedPages'], 'readwrite');
      const pagesStore = pagesTransaction.objectStore('capturedPages');
      pagesStore.clear();
      
      // Limpa histórico
      const historyTransaction = this.db.transaction(['captureHistory'], 'readwrite');
      const historyStore = historyTransaction.objectStore('captureHistory');
      historyStore.clear();
      
      // Limpa indexação de links
      const linkTransaction = this.db.transaction(['linkIndex'], 'readwrite');
      const linkStore = linkTransaction.objectStore('linkIndex');
      linkStore.clear();
      
      // Limpa análise de conteúdo
      const contentTransaction = this.db.transaction(['contentAnalysis'], 'readwrite');
      const contentStore = contentTransaction.objectStore('contentAnalysis');
      contentStore.clear();

      // Limpa fila de captura
      const queueTransaction = this.db.transaction(['captureQueue'], 'readwrite');
      const queueStore = queueTransaction.objectStore('captureQueue');
      queueStore.clear();
      
      // Reseta estatísticas
      this.stats = {
        totalPages: 0,
        uniqueHosts: new Set(),
        lastUpdated: Date.now()
      };
      this.captureHistory = [];
      this.captureQueue = []; // Limpa a fila
      this.isProcessingQueue = false; // Reseta o flag
      
      console.log('🗑️ Dados limpos');
      
    } catch (error) {
      console.error('❌ Erro ao limpar dados:', error);
    }
  }

  /**
   * Inicia sistema de heartbeat para manter conexão ativa
   */
  startHeartbeat() {
    console.log('💓 Iniciando sistema de heartbeat...');
    
    // Limpa intervalos existentes
    this.stopHeartbeat();
    
    // Envia PING a cada 30 segundos
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnectedToServer && this.serverConnection && this.serverConnection.readyState === WebSocket.OPEN) {
        console.log('💓 Enviando PING para manter conexão ativa');
        this.sendToServer({
          type: 'PING',
          peerId: this.peerId,
          timestamp: Date.now()
        });
        
        // Define timeout para resposta PONG
        this.heartbeatTimeout = setTimeout(() => {
          console.log('⏰ Timeout do heartbeat, reconectando...');
          this.handleServerDisconnection();
        }, 10000); // 10 segundos para responder
      }
    }, 30000); // 30 segundos entre PINGs
    
    console.log('✅ Heartbeat iniciado');
  }
  
  /**
   * Para sistema de heartbeat
   */
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
      console.log('💓 Heartbeat parado');
    }
    
    if (this.heartbeatTimeout) {
      clearTimeout(this.heartbeatTimeout);
      this.heartbeatTimeout = null;
    }
  }

  /**
   * Processa links para indexação
   */
  async processLinksForIndexing(links, sourceHostname) {
    try {
      if (!this.db) return;
      
      const transaction = this.db.transaction(['linkIndex'], 'readwrite');
      const store = transaction.objectStore('linkIndex');
      
      for (const link of links) {
        // Normaliza URL
        let normalizedUrl = link.url;
        if (link.url.startsWith('/')) {
          normalizedUrl = `https://${sourceHostname}${link.url}`;
        } else if (link.url.startsWith('./')) {
          normalizedUrl = `https://${sourceHostname}${link.url.substring(1)}`;
        }
        
        const linkEntry = {
          url: normalizedUrl,
          text: link.text,
          title: link.title,
          type: link.type,
          relevance: link.relevance,
          sourceUrl: this.currentPageUrl || '',
          sourceHostname: sourceHostname,
          discoveredAt: Date.now(),
          lastSeen: Date.now(),
          clickCount: 0
        };
        
        // Salva ou atualiza link
        await store.put(linkEntry);
      }
      
      console.log(`✅ ${links.length} links indexados`);
      
    } catch (error) {
      console.error('❌ Erro ao processar links:', error);
    }
  }
  
  /**
   * Processa análise de conteúdo
   */
  async processContentAnalysis(analysis, sourceUrl) {
    try {
      if (!this.db) return;
      
      const transaction = this.db.transaction(['contentAnalysis'], 'readwrite');
      const store = transaction.objectStore('contentAnalysis');
      
      const analysisEntry = {
        url: sourceUrl,
        contentType: analysis.contentType,
        topics: analysis.topics || [],
        entities: analysis.entities || {},
        sentiment: analysis.sentiment || 'neutral',
        readingLevel: analysis.readingLevel || 'intermediate',
        contentStructure: analysis.contentStructure || {},
        analyzedAt: Date.now()
      };
      
      await store.put(analysisEntry);
      console.log(`✅ Análise de conteúdo salva para ${sourceUrl}`);
      
    } catch (error) {
      console.error('❌ Erro ao processar análise de conteúdo:', error);
    }
  }

  /**
   * Inicia crawling automático para descobrir artigos
   */
  async startArticleCrawling(links, sourceHostname) {
    try {
      console.log(`🔍 Analisando ${links.length} links para crawling...`);
      
      // Filtra links de artigos com critérios mais flexíveis
      const articleLinks = links.filter(link => {
        const isArticle = link.type === 'article';
        const hasGoodRelevance = link.relevance > 0.3;
        const isNotAnchor = !link.url.includes('#');
        const isNotCurrentPage = link.url !== this.currentPageUrl;
        const hasRelevantText = this.isRelevantArticleText(link.text);
        
        console.log(`🔗 Link "${link.text}":`, {
          type: link.type,
          relevance: link.relevance,
          isArticle,
          hasGoodRelevance,
          isNotAnchor,
          isNotCurrentPage,
          hasRelevantText,
          url: link.url
        });
        
        return (isArticle || hasRelevantText) && hasGoodRelevance && isNotAnchor && isNotCurrentPage;
      });
      
      console.log(`📰 ${articleLinks.length} links de artigos identificados para crawling`);
      
      if (articleLinks.length === 0) {
        console.log('⚠️ Nenhum link de artigo relevante encontrado para crawling');
        return;
      }
      
      // Adiciona TODOS os links relevantes à fila (sem limite)
      for (const link of articleLinks) {
        try {
          console.log(`📋 Processando link: ${link.text} (${link.url})`);
          
          // Verifica se já foi capturado
          const alreadyCaptured = await this.checkIfPageAlreadyCaptured(link.url);
          if (alreadyCaptured) {
            console.log(`⏭️ Artigo já capturado: ${link.text}`);
            continue;
          }
          
          // Agenda captura do artigo
          await this.scheduleArticleCapture(link.url, link.text, 'discovery');
          
          // Atualiza estatísticas
          this.crawlingStats.totalDiscovered++;
          
        } catch (error) {
          console.error(`❌ Erro ao processar link ${link.url}:`, error);
        }
      }
      
      // Inicia processamento da fila se não estiver rodando
      if (!this.isProcessingQueue) {
        this.processCaptureQueue();
      }
      
    } catch (error) {
      console.error('❌ Erro ao iniciar crawling:', error);
    }
  }
  
  /**
   * Verifica se o texto do link indica um artigo relevante
   */
  isRelevantArticleText(text) {
    if (!text || text.length < 10) return false;
    
    const textLower = text.toLowerCase();
    
    // Palavras-chave que indicam artigos
    const articleKeywords = [
      'lançado', 'lançada', 'disponível', 'chegou', 'novo', 'nova',
      'como instalar', 'como fazer', 'tutorial', 'dica', 'guia',
      'review', 'análise', 'teste', 'comparativo', 'configurar',
      'atualização', 'correção', 'melhoria', 'feature', 'funcionalidade',
      'instalar', 'configurar', 'personalizar', 'otimizar', 'resolver',
      'problema', 'solução', 'alternativa', 'recomendação', 'opinião'
    ];
    
    return articleKeywords.some(keyword => textLower.includes(keyword));
  }
  
  /**
   * Agenda captura de um artigo
   */
  async scheduleArticleCapture(url, title, sourceType = 'crawling') {
    try {
      // Gera ID único para a tarefa
      const taskId = `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const captureTask = {
        id: taskId,
        url: url,
        title: title,
        priority: 'medium',
        scheduledAt: Date.now(),
        attempts: 0,
        maxAttempts: 3,
        sourceType: sourceType,
        status: 'pending' // pending, processing, completed, failed
      };
      
      // Adiciona à fila em memória
      if (!this.captureQueue) {
        this.captureQueue = [];
      }
      this.captureQueue.push(captureTask);
      
      // Salva no IndexedDB para persistência
      await this.saveTaskToQueue(captureTask);
      
      console.log(`📅 Artigo agendado para captura: ${title} (Tipo: ${sourceType}, ID: ${taskId})`);
      
      // Inicia processamento da fila se não estiver rodando
      if (!this.isProcessingQueue) {
        this.processCaptureQueue();
      }
      
    } catch (error) {
      console.error('❌ Erro ao agendar captura:', error);
    }
  }
  
  /**
   * Salva tarefa na fila persistente
   */
  async saveTaskToQueue(task) {
    try {
      if (!this.db) return;
      
      const transaction = this.db.transaction(['captureQueue'], 'readwrite');
      const store = transaction.objectStore('captureQueue');
      
      await store.put(task);
      console.log(`💾 Tarefa salva na fila persistente: ${task.title}`);
      
    } catch (error) {
      console.error('❌ Erro ao salvar tarefa na fila:', error);
    }
  }
  
  /**
   * Processa a fila de captura
   */
  async processCaptureQueue() {
    if (this.isProcessingQueue || !this.captureQueue || this.captureQueue.length === 0) {
      return;
    }
    
    this.isProcessingQueue = true;
    console.log(`🔄 Processando fila de captura com ${this.captureQueue.length} itens`);
    
    while (this.captureQueue.length > 0) {
      const task = this.captureQueue.shift();
      
      try {
        // Atualiza status para 'processing'
        task.status = 'processing';
        await this.updateTaskStatus(task);
        
        console.log(`📰 Capturando artigo: ${task.title} (${this.captureQueue.length} restantes na fila)`);
        await this.captureArticleFromQueue(task);
        
        // Atualiza status para 'completed'
        task.status = 'completed';
        await this.updateTaskStatus(task);
        
        // Aguarda 1 segundo entre capturas para não sobrecarregar
        await new Promise(resolve => setTimeout(resolve, 1000));
        
      } catch (error) {
        console.error(`❌ Erro ao capturar artigo ${task.title}:`, error);
        
        // Recoloca na fila se ainda não excedeu tentativas
        if (task.attempts < task.maxAttempts) {
          task.attempts++;
          task.scheduledAt = Date.now();
          task.status = 'pending';
          this.captureQueue.push(task);
          
          // Atualiza status no IndexedDB
          await this.updateTaskStatus(task);
          
          console.log(`🔄 Recolocando na fila: ${task.title} (tentativa ${task.attempts})`);
        } else {
          // Atualiza status para 'failed'
          task.status = 'failed';
          await this.updateTaskStatus(task);
          
          console.log(`❌ Artigo removido da fila após ${task.maxAttempts} tentativas: ${task.title}`);
          
          // Atualiza estatísticas
          this.crawlingStats.totalFailed++;
        }
      }
    }
    
    this.isProcessingQueue = false;
    console.log('✅ Fila de captura processada');
    
    // Verifica se há novos itens na fila (descoberta recursiva pode ter adicionado)
    if (this.captureQueue.length > 0) {
      console.log(`🔄 ${this.captureQueue.length} novos itens adicionados, continuando processamento...`);
      this.processCaptureQueue();
    }
  }
  
  /**
   * Atualiza status de uma tarefa no IndexedDB
   */
  async updateTaskStatus(task) {
    try {
      if (!this.db) return;
      
      const transaction = this.db.transaction(['captureQueue'], 'readwrite');
      const store = transaction.objectStore('captureQueue');
      
      await store.put(task);
      
    } catch (error) {
      console.error('❌ Erro ao atualizar status da tarefa:', error);
    }
  }
  
  /**
   * Captura um artigo da fila
   */
  async captureArticleFromQueue(task) {
    try {
      // Simula navegação para a página do artigo
      const articleData = await this.fetchArticleContent(task.url);
      
      if (articleData) {
        // Salva o artigo capturado
        await this.savePageData({
          url: task.url,
          title: articleData.title || task.title,
          hostname: new URL(task.url).hostname,
          timestamp: Date.now(),
          capturedBy: 'crawling',
          meta: articleData.meta || {},
          headings: articleData.headings || [],
          paragraphs: articleData.paragraphs || [],
          lists: articleData.lists || [],
          links: articleData.links || [],
          contentAnalysis: articleData.contentAnalysis || {},
          terms: articleData.terms || [],
          sourceType: task.sourceType // Adiciona o tipo de origem
        });
        
        console.log(`✅ Artigo capturado com sucesso: ${task.title}`);
        
        // Atualiza estatísticas
        this.crawlingStats.totalCaptured++;
        
        // Adiciona ao histórico
        await this.addToHistory({
          url: task.url,
          title: articleData.title || task.title,
          hostname: new URL(task.url).hostname,
          timestamp: Date.now(),
          capturedBy: 'crawling'
        });
        
        // Notifica progresso do crawling
        await this.notifyCrawlingProgress(this.crawlingStats);
        
        // Processa links do artigo para descoberta adicional
        if (articleData.links && articleData.links.length > 0) {
          console.log(`🔍 Artigo tem ${articleData.links.length} links, analisando para descoberta...`);
          
          // Filtra links relevantes do artigo
          const relevantLinks = articleData.links.filter(link => {
            if (!link.text || link.text.length < 10) return false;
            
            const textLower = link.text.toLowerCase();
            const isRelevant = textLower.includes('lançado') || textLower.includes('lançada') ||
                              textLower.includes('como instalar') || textLower.includes('tutorial') ||
                              textLower.includes('dica') || textLower.includes('guia') ||
                              textLower.includes('novo') || textLower.includes('nova') ||
                              textLower.includes('atualização') || textLower.includes('disponível');
            
            return isRelevant;
          });
          
          if (relevantLinks.length > 0) {
            console.log(`🆕 ${relevantLinks.length} novos links relevantes descobertos no artigo`);
            
            // Adiciona novos links à fila para descoberta futura
            for (const link of relevantLinks) {
              try {
                // Verifica se já foi capturado
                const alreadyCaptured = await this.checkIfPageAlreadyCaptured(link.url);
                if (!alreadyCaptured) {
                  await this.scheduleArticleCapture(link.url, link.text, 'recursive_discovery');
                  console.log(`🔄 Novo link adicionado à fila: ${link.text}`);
                }
              } catch (error) {
                console.error(`❌ Erro ao processar link recursivo ${link.url}:`, error);
              }
            }
          }
          
          // Processa links para indexação
          await this.processLinksForIndexing(articleData.links, new URL(task.url).hostname);
        }
      }
      
    } catch (error) {
      throw new Error(`Falha ao capturar artigo: ${error.message}`);
    }
  }
  
  /**
   * Busca conteúdo de um artigo via fetch
   */
  async fetchArticleContent(url) {
    try {
      console.log(`📡 Buscando conteúdo de: ${url}`);
      
      // Usa fetch para buscar o conteúdo HTML
      const response = await fetch(url);
      const html = await response.text();
      
      console.log(`📄 HTML recebido (${html.length} caracteres)`);
      
      // Extrai dados básicos usando regex (sem DOMParser)
      const title = this.extractTitleFromHTML(html);
      const meta = this.extractMetaFromHTMLString(html);
      const headings = this.extractHeadingsFromHTMLString(html);
      const paragraphs = this.extractParagraphsFromHTMLString(html);
      const lists = this.extractListsFromHTMLString(html);
      const links = this.extractLinksFromHTMLString(html);
      
      // Gera termos de busca
      const terms = this.generateTermsFromContent(title, headings, paragraphs);
      
      console.log(`✅ Conteúdo extraído: título="${title}", ${headings.length} headings, ${paragraphs.length} parágrafos`);
      
      return {
        title,
        meta,
        headings,
        paragraphs,
        lists,
        links,
        terms
      };
      
    } catch (error) {
      console.error(`❌ Erro ao buscar conteúdo de ${url}:`, error);
      return null;
    }
  }
  
  /**
   * Extrai título usando regex
   */
  extractTitleFromHTML(html) {
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    return titleMatch ? titleMatch[1].trim() : '';
  }
  
  /**
   * Extrai metadados usando regex
   */
  extractMetaFromHTMLString(html) {
    const meta = {};
    const metaRegex = /<meta[^>]+(?:name|property)=["']([^"']+)["'][^>]+content=["']([^"']+)["'][^>]*>/gi;
    
    let match;
    while ((match = metaRegex.exec(html)) !== null) {
      const name = match[1];
      const content = match[2];
      if (name && content) {
        meta[name] = content;
      }
    }
    
    return meta;
  }
  
  /**
   * Extrai headings usando regex
   */
  extractHeadingsFromHTMLString(html) {
    const headings = [];
    const headingRegex = /<(h[1-6])[^>]*>([^<]+)<\/h[1-6]>/gi;
    
    let match;
    while ((match = headingRegex.exec(html)) !== null) {
      const level = parseInt(match[1].charAt(1));
      const text = match[2].trim();
      if (text && text.length > 0) {
        headings.push({ level, text });
      }
    }
    
    return headings;
  }
  
  /**
   * Extrai parágrafos usando regex
   */
  extractParagraphsFromHTMLString(html) {
    const paragraphs = [];
    const paragraphRegex = /<p[^>]*>([^<]+)<\/p>/gi;
    
    let match;
    while ((match = paragraphRegex.exec(html)) !== null) {
      const text = match[1].trim();
      if (text && text.length > 10) {
        paragraphs.push(text);
      }
    }
    
    return paragraphs;
  }
  
  /**
   * Extrai listas usando regex
   */
  extractListsFromHTMLString(html) {
    const lists = [];
    
    // Extrai listas <ul>
    const ulRegex = /<ul[^>]*>([\s\S]*?)<\/ul>/gi;
    let ulMatch;
    while ((ulMatch = ulRegex.exec(html)) !== null) {
      const items = [];
      const liRegex = /<li[^>]*>([^<]+)<\/li>/gi;
      let liMatch;
      while ((liMatch = liRegex.exec(ulMatch[1])) !== null) {
        const text = liMatch[1].trim();
        if (text && text.length > 0) {
          items.push(text);
        }
      }
      if (items.length > 0) {
        lists.push({ type: 'ul', items });
      }
    }
    
    // Extrai listas <ol>
    const olRegex = /<ol[^>]*>([\s\S]*?)<\/ol>/gi;
    let olMatch;
    while ((olMatch = olRegex.exec(html)) !== null) {
      const items = [];
      const liRegex = /<li[^>]*>([^<]+)<\/li>/gi;
      let liMatch;
      while ((liMatch = liRegex.exec(olMatch[1])) !== null) {
        const text = liMatch[1].trim();
        if (text && text.length > 0) {
          items.push(text);
        }
      }
      if (items.length > 0) {
        lists.push({ type: 'ol', items });
      }
    }
    
    return lists;
  }
  
  /**
   * Extrai links usando regex
   */
  extractLinksFromHTMLString(html) {
    const links = [];
    const linkRegex = /<a[^>]+href=["']([^"']+)["'][^>]*>([^<]+)<\/a>/gi;
    
    let match;
    while ((match = linkRegex.exec(html)) !== null) {
      const href = match[1];
      const text = match[2].trim();
      
      if (href && text && text.length > 0) {
        links.push({
          url: href,
          text: text,
          type: 'general',
          relevance: 0.5
        });
      }
    }
    
    return links;
  }
  
  /**
   * Gera termos de busca a partir do conteúdo
   */
  generateTermsFromContent(title, headings, paragraphs) {
    const allText = [
      title,
      ...headings.map(h => h.text),
      ...paragraphs
    ].join(' ').toLowerCase();
    
    // Extrai palavras únicas
    const words = allText.match(/\b\w{4,}\b/g) || [];
    const uniqueWords = [...new Set(words)];
    
    // Filtra palavras comuns
    const commonWords = ['para', 'com', 'uma', 'este', 'essa', 'isso', 'aqui', 'onde', 'quando', 'como', 'porque'];
    const filteredWords = uniqueWords.filter(word => 
      !commonWords.includes(word) && word.length > 3
    );
    
    return filteredWords.slice(0, 20);
  }

  /**
   * Sistema de Notificações
   */
  
  /**
   * Carrega configurações de notificação
   */
  async loadNotificationSettings() {
    try {
      const result = await chrome.storage.local.get(['notificationSettings']);
      if (result.notificationSettings) {
        this.notificationSettings = { ...this.notificationSettings, ...result.notificationSettings };
        console.log('🔔 Configurações de notificação carregadas:', this.notificationSettings);
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
      await chrome.storage.local.set({ notificationSettings: this.notificationSettings });
      console.log('💾 Configurações de notificação salvas');
    } catch (error) {
      console.error('❌ Erro ao salvar configurações de notificação:', error);
    }
  }
  
  /**
   * Carrega configurações do botão flutuante
   */
  async loadFloatingCaptureSettings() {
    try {
      const result = await chrome.storage.local.get(['floatingCaptureSettings']);
      if (result.floatingCaptureSettings) {
        this.floatingCaptureSettings = { ...this.floatingCaptureSettings, ...result.floatingCaptureSettings };
        console.log('🎯 Configurações do botão flutuante carregadas:', this.floatingCaptureSettings);
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
      await chrome.storage.local.set({
        floatingCaptureSettings: this.floatingCaptureSettings
      });
      console.log('💾 Configurações do botão flutuante salvas');
    } catch (error) {
      console.error('❌ Erro ao salvar configurações do botão flutuante:', error);
    }
  }
  
  /**
   * Cria notificação
   */
  async createNotification(options) {
    try {
      if (!this.notificationSettings.enabled) {
        console.log('🔕 Notificações desabilitadas');
        return;
      }
      
      const notificationOptions = {
        type: 'basic',
        iconUrl: 'icons/icon48.png',
        priority: 1,
        ...options
      };
      
      // Cria notificação única
      const notificationId = `buscalogo_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      await chrome.notifications.create(notificationId, notificationOptions);
      console.log('🔔 Notificação criada:', notificationOptions.title);
      
      // Atualiza badge se habilitado
      if (this.notificationSettings.showBadge) {
        this.updateBadge();
      }
      
    } catch (error) {
      console.error('❌ Erro ao criar notificação:', error);
    }
  }
  
  /**
   * Notifica nova página capturada
   */
  async notifyNewPageCaptured(pageData) {
    if (!this.notificationSettings.newPageCaptured) return;
    
    await this.createNotification({
      title: '📄 Nova Página Capturada',
      message: `${pageData.title || 'Página sem título'} foi adicionada ao índice`,
      contextMessage: 'BuscaLogo'
    });
  }
  
  /**
   * Notifica progresso do crawling
   */
  async notifyCrawlingProgress(stats) {
    if (!this.notificationSettings.crawlingProgress) return;
    
    const { totalDiscovered, totalCaptured, totalFailed } = stats;
    
    if (totalCaptured > 0 && totalCaptured % 5 === 0) { // Notifica a cada 5 páginas
      await this.createNotification({
        title: '🕷️ Crawling em Progresso',
        message: `${totalCaptured} páginas capturadas, ${totalDiscovered - totalCaptured} na fila`,
        contextMessage: 'BuscaLogo'
      });
    }
  }
  
  /**
   * Notifica mudança de status de conexão
   */
  async notifyConnectionStatus(isConnected) {
    if (!this.notificationSettings.connectionStatus) return;
    
    const wasConnected = this.isConnectedToServer;
    this.isConnectedToServer = isConnected;
    
    // Só notifica se houve mudança real de status
    if (wasConnected !== isConnected) {
      if (isConnected) {
        await this.createNotification({
          title: '🔗 Conectado ao Servidor',
          message: 'BuscaLogo está conectado e funcionando',
          contextMessage: 'BuscaLogo'
        });
      } else {
        await this.createNotification({
          title: '🔌 Desconectado do Servidor',
          message: 'Tentando reconectar automaticamente...',
          contextMessage: 'BuscaLogo'
        });
      }
    }
  }
  
  /**
   * Atualiza badge da extensão
   */
  async updateBadge() {
    try {
      if (!this.notificationSettings.showBadge) {
        await chrome.action.setBadgeText({ text: '' });
        return;
      }
      
      // Calcula número de notificações pendentes
      const pendingNotifications = this.notificationQueue.length;
      
      if (pendingNotifications > 0) {
        const badgeText = pendingNotifications > 99 ? '99+' : pendingNotifications.toString();
        await chrome.action.setBadgeText({ text: badgeText });
        await chrome.action.setBadgeBackgroundColor({ color: '#FF5722' });
      } else {
        await chrome.action.setBadgeText({ text: '' });
      }
      
    } catch (error) {
      console.error('❌ Erro ao atualizar badge:', error);
    }
  }
  
  /**
   * Sistema de Analytics
   */
  
  /**
   * Obtém dados para o dashboard de analytics
   */
  async getAnalyticsData() {
    try {
      if (!this.db) return {};
      
      const data = {
        totalLinks: 0,
        totalAnalyses: 0,
        dbSize: 0,
        lastUpdate: Date.now(),
        pagesPerDay: [],
        topDomains: [],
        qualityMetrics: {}
      };
      
      // Conta links indexados
      try {
        const linkTransaction = this.db.transaction(['linkIndex'], 'readonly');
        const linkStore = linkTransaction.objectStore('linkIndex');
        const linkCount = await this.getStoreCount(linkStore);
        data.totalLinks = linkCount;
      } catch (error) {
        console.warn('⚠️ Erro ao contar links:', error);
      }
      
      // Conta análises de conteúdo
      try {
        const analysisTransaction = this.db.transaction(['contentAnalysis'], 'readonly');
        const analysisStore = analysisTransaction.objectStore('contentAnalysis');
        const analysisCount = await this.getStoreCount(analysisStore);
        data.totalAnalyses = analysisCount;
      } catch (error) {
        console.warn('⚠️ Erro ao contar análises:', error);
      }
      
      // Calcula tamanho aproximado do banco
      data.dbSize = await this.estimateDatabaseSize();
      
      // Gera dados de páginas por dia (últimos 7 dias)
      data.pagesPerDay = await this.generatePagesPerDayData();
      
      // Gera dados de top domínios
      data.topDomains = await this.generateTopDomainsData();
      
      // Calcula métricas de qualidade
      data.qualityMetrics = await this.calculateQualityMetrics();
      
      console.log('📊 Dados de analytics gerados:', data);
      return data;
      
    } catch (error) {
      console.error('❌ Erro ao gerar dados de analytics:', error);
      return {};
    }
  }
  
  /**
   * Exporta dados completos para download
   */
  async exportAnalyticsData() {
    try {
      if (!this.db) return {};
      
      const exportData = {
        exportDate: new Date().toISOString(),
        version: '1.0.0',
        stats: this.stats,
        crawlingStats: this.crawlingStats,
        analytics: await this.getAnalyticsData(),
        pages: await this.getAllPagesData(),
        links: await this.getAllLinksData(),
        analyses: await this.getAllAnalysesData()
      };
      
      console.log('📤 Dados de exportação preparados:', exportData);
      return exportData;
      
    } catch (error) {
      console.error('❌ Erro ao exportar dados:', error);
      return {};
    }
  }
  
  /**
   * Conta registros em uma store
   */
  async getStoreCount(store) {
    return new Promise((resolve) => {
      const request = store.count();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => resolve(0);
    });
  }
  
  /**
   * Estima tamanho do banco de dados
   */
  async estimateDatabaseSize() {
    try {
      // Estimativa baseada no número de registros
      let totalSize = 0;
      
      // Páginas capturadas (estimativa: 2KB por página)
      totalSize += (this.stats.totalPages || 0) * 2048;
      
      // Links indexados (estimativa: 500B por link)
      const linkCount = await this.getStoreCount(
        this.db.transaction(['linkIndex'], 'readonly').objectStore('linkIndex')
      );
      totalSize += linkCount * 500;
      
      // Análises de conteúdo (estimativa: 1KB por análise)
      const analysisCount = await this.getStoreCount(
        this.db.transaction(['contentAnalysis'], 'readonly').objectStore('contentAnalysis')
      );
      totalSize += analysisCount * 1024;
      
      return totalSize;
      
    } catch (error) {
      console.warn('⚠️ Erro ao estimar tamanho do banco:', error);
      return 0;
    }
  }
  
  /**
   * Gera dados de páginas por dia
   */
  async generatePagesPerDayData() {
    try {
      const pagesPerDay = [];
      const today = new Date();
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateString = date.toDateString();
        
        // Conta páginas capturadas neste dia
        let pageCount = 0;
        try {
          const transaction = this.db.transaction(['capturedPages'], 'readonly');
          const store = transaction.objectStore('capturedPages');
          const index = store.index('timestamp');
          
          const startOfDay = new Date(date);
          startOfDay.setHours(0, 0, 0, 0);
          const endOfDay = new Date(date);
          endOfDay.setHours(23, 59, 59, 999);
          
          const range = IDBKeyRange.bound(startOfDay.getTime(), endOfDay.getTime());
          const request = index.count(range);
          
          pageCount = await new Promise((resolve) => {
            request.onsuccess = () => resolve(request.result);
            request.onerror = () => resolve(0);
          });
          
        } catch (error) {
          console.warn(`⚠️ Erro ao contar páginas para ${dateString}:`, error);
        }
        
        pagesPerDay.push({
          date: dateString,
          count: pageCount
        });
      }
      
      return pagesPerDay;
      
    } catch (error) {
      console.warn('⚠️ Erro ao gerar dados de páginas por dia:', error);
      return [];
    }
  }
  
  /**
   * Gera dados de top domínios
   */
  async generateTopDomainsData() {
    try {
      const domainCounts = new Map();
      
      // Conta páginas por domínio
      const transaction = this.db.transaction(['capturedPages'], 'readonly');
      const store = transaction.objectStore('capturedPages');
      const request = store.getAll();
      
      const pages = await new Promise((resolve) => {
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => resolve([]);
      });
      
      pages.forEach(page => {
        if (page.hostname) {
          const count = domainCounts.get(page.hostname) || 0;
          domainCounts.set(page.hostname, count + 1);
        }
      });
      
      // Ordena por contagem e retorna top 10
      const sortedDomains = Array.from(domainCounts.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([domain, count]) => ({ domain, count }));
      
      return sortedDomains;
      
    } catch (error) {
      console.warn('⚠️ Erro ao gerar dados de top domínios:', error);
      return [];
    }
  }
  
  /**
   * Calcula métricas de qualidade
   */
  async calculateQualityMetrics() {
    try {
      const metrics = {
        avgScore: 0,
        highQualityPages: 0,
        lowQualityPages: 0,
        totalScored: 0
      };
      
      // Calcula score médio baseado em relevância dos links
      const linkTransaction = this.db.transaction(['linkIndex'], 'readonly');
      const linkStore = linkTransaction.objectStore('linkIndex');
      const request = linkStore.getAll();
      
      const links = await new Promise((resolve) => {
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => resolve([]);
      });
      
      if (links.length > 0) {
        const totalRelevance = links.reduce((sum, link) => sum + (link.relevance || 0), 0);
        metrics.avgScore = totalRelevance / links.length;
        metrics.totalScored = links.length;
        
        // Classifica páginas por qualidade
        metrics.highQualityPages = links.filter(link => (link.relevance || 0) > 0.7).length;
        metrics.lowQualityPages = links.filter(link => (link.relevance || 0) < 0.3).length;
      }
      
      return metrics;
      
    } catch (error) {
      console.warn('⚠️ Erro ao calcular métricas de qualidade:', error);
      return {};
    }
  }
  
  /**
   * Obtém dados de todas as páginas para exportação
   */
  async getAllPagesData() {
    try {
      const transaction = this.db.transaction(['capturedPages'], 'readonly');
      const store = transaction.objectStore('capturedPages');
      const request = store.getAll();
      
      return await new Promise((resolve) => {
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => resolve([]);
      });
      
    } catch (error) {
      console.warn('⚠️ Erro ao obter dados das páginas:', error);
      return [];
    }
  }
  
  /**
   * Obtém dados de todos os links para exportação
   */
  async getAllLinksData() {
    try {
      const transaction = this.db.transaction(['linkIndex'], 'readonly');
      const store = transaction.objectStore('linkIndex');
      const request = store.getAll();
      
      return await new Promise((resolve) => {
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => resolve([]);
      });
      
    } catch (error) {
      console.warn('⚠️ Erro ao obter dados dos links:', error);
      return [];
    }
  }
  
  /**
   * Obtém dados de todas as análises para exportação
   */
  async getAllAnalysesData() {
    try {
      const transaction = this.db.transaction(['contentAnalysis'], 'readonly');
      const store = transaction.objectStore('contentAnalysis');
      const request = store.getAll();
      
      return await new Promise((resolve) => {
        request.onsuccess = () => resolve(request.result || []);
        request.onerror = () => resolve([]);
      });
      
    } catch (error) {
      console.warn('⚠️ Erro ao obter dados das análises:', error);
      return [];
    }
  }

  /**
   * Limpa notificações antigas
   */
  async clearOldNotifications() {
    try {
      const notifications = await chrome.notifications.getAll();
      
      for (const [id, notification] of Object.entries(notifications)) {
        if (id.startsWith('buscalogo_')) {
          // Remove notificações com mais de 1 hora
          const notificationTime = parseInt(id.split('_')[1]);
          if (Date.now() - notificationTime > 3600000) {
            await chrome.notifications.clear(id);
          }
        }
      }
      
    } catch (error) {
      console.error('❌ Erro ao limpar notificações antigas:', error);
    }
  }

  /**
   * Limpa tarefas antigas da fila persistente
   */
  async cleanupOldTasks() {
    try {
      if (!this.db) return;
      
      const transaction = this.db.transaction(['captureQueue'], 'readwrite');
      const store = transaction.objectStore('captureQueue');
      const request = store.getAll();
      
      request.onsuccess = () => {
        const allTasks = request.result || [];
        const now = Date.now();
        const oneDayAgo = now - (24 * 60 * 60 * 1000); // 24 horas atrás
        
        // Remove tarefas completadas ou falhadas com mais de 24 horas
        allTasks.forEach(async (task) => {
          if ((task.status === 'completed' || task.status === 'failed') && 
              task.scheduledAt < oneDayAgo) {
            try {
              await store.delete(task.id);
              console.log(`🗑️ Tarefa antiga removida: ${task.title}`);
            } catch (error) {
              console.error('❌ Erro ao remover tarefa antiga:', error);
            }
          }
        });
      };
      
    } catch (error) {
      console.error('❌ Erro ao limpar tarefas antigas:', error);
    }
  }
  
  /**
   * Obtém contagem de favoritos do navegador
   */
  async getFavoritesCount() {
    try {
      const bookmarks = await chrome.bookmarks.getTree();
      let count = 0;
      
      // Função recursiva para contar bookmarks
      const countBookmarks = (nodes) => {
        for (const node of nodes) {
          if (node.url) {
            count++;
          } else if (node.children) {
            countBookmarks(node.children);
          }
        }
      };
      
      countBookmarks(bookmarks);
      console.log(`⭐ Total de favoritos encontrados: ${count}`);
      return count;
      
    } catch (error) {
      console.error('❌ Erro ao obter contagem de favoritos:', error);
      return 0;
    }
  }
  
  /**
   * Importa favoritos do navegador para o sistema
   */
  async importFavorites() {
    try {
      console.log('📥 Iniciando importação de favoritos...');
      
      // Obtém todos os bookmarks
      const bookmarks = await chrome.bookmarks.getTree();
      const urlsToProcess = [];
      
      // Função recursiva para extrair URLs
      const extractUrls = (nodes) => {
        for (const node of nodes) {
          if (node.url && node.title) {
            urlsToProcess.push({
              url: node.url,
              title: node.title,
              dateAdded: node.dateAdded || Date.now()
            });
          } else if (node.children) {
            extractUrls(node.children);
          }
        }
      };
      
      extractUrls(bookmarks);
      console.log(`📥 ${urlsToProcess.length} favoritos encontrados para processamento`);
      
      if (urlsToProcess.length === 0) {
        return { imported: 0, total: 0, errors: 0 };
      }
      
      let imported = 0;
      let errors = 0;
      
      // Processa cada favorito
      for (const bookmark of urlsToProcess) {
        try {
          // Verifica se já foi capturado
          const isAlreadyCaptured = await this.checkPageCaptured(bookmark.url);
          
          if (!isAlreadyCaptured) {
            // Cria dados básicos da página
            const pageData = {
              url: bookmark.url,
              title: bookmark.title,
              hostname: new URL(bookmark.url).hostname,
              timestamp: bookmark.dateAdded,
              source: 'bookmark_import',
              terms: this.extractTermsFromTitle(bookmark.title),
              content: '', // Conteúdo será preenchido se a página for acessada
              metadata: {
                importedFrom: 'chrome_bookmarks',
                importDate: Date.now()
              }
            };
            
            // Salva no banco de dados
            await this.savePageData(pageData);
            imported++;
            
            console.log(`✅ Favorito importado: ${bookmark.title}`);
            
            // Notifica se configurado
            if (this.notificationSettings.enabled && this.notificationSettings.newPageCaptured) {
              await this.createNotification({
                title: '⭐ Favorito Importado',
                message: `"${bookmark.title}" foi adicionado ao sistema`,
                contextMessage: 'BuscaLogo'
              });
            }
          } else {
            console.log(`ℹ️ Favorito já existe: ${bookmark.title}`);
          }
          
        } catch (error) {
          console.error(`❌ Erro ao importar favorito ${bookmark.title}:`, error);
          errors++;
        }
      }
      
      // Atualiza estatísticas
      await this.updateStats();
      
      const result = { imported, total: urlsToProcess.length, errors };
      console.log(`✅ Importação concluída: ${imported} importados, ${errors} erros`);
      
      return result;
      
    } catch (error) {
      console.error('❌ Erro na importação de favoritos:', error);
      throw error;
    }
  }
  
  /**
   * Extrai termos de busca do título da página
   */
  extractTermsFromTitle(title) {
    if (!title) return [];
    
    // Remove caracteres especiais e divide em palavras
    const terms = title
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter(term => term.length > 2) // Remove palavras muito curtas
      .filter(term => !this.isCommonWord(term)); // Remove palavras comuns
    
    return terms;
  }
  
  /**
   * Verifica se uma palavra é muito comum
   */
  isCommonWord(word) {
    const commonWords = [
      'a', 'o', 'e', 'de', 'da', 'do', 'em', 'um', 'uma', 'para', 'com', 'não', 'na', 'no',
      'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'is', 'are',
      'was', 'were', 'be', 'been', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
      'can', 'could', 'may', 'might', 'must', 'shall', 'should'
    ];
    
    return commonWords.includes(word.toLowerCase());
  }
  
  /**
   * Testa o banco de dados
   */
  async testDatabase() {
    try {
      console.log('🧪 BuscaLogo: Testando banco de dados...');
      
      const result = {
        dbExists: !!this.db,
        stores: [],
        totalPages: 0,
        samplePages: []
      };
      
      if (this.db) {
        result.stores = Array.from(this.db.objectStoreNames);
        
        // Conta páginas capturadas
        const transaction = this.db.transaction(['capturedPages'], 'readonly');
        const pagesStore = transaction.objectStore('capturedPages');
        const countRequest = pagesStore.count();
        
        return new Promise((resolve) => {
          countRequest.onsuccess = () => {
            result.totalPages = countRequest.result;
            
            // Pega algumas páginas de exemplo
            const sampleRequest = pagesStore.getAll();
            sampleRequest.onsuccess = () => {
              result.samplePages = sampleRequest.result.slice(0, 3);
              console.log('🧪 BuscaLogo: Resultado do teste do banco:', result);
              resolve(result);
            };
          };
        });
      } else {
        return result;
      }
      
    } catch (error) {
      console.error('❌ BuscaLogo: Erro ao testar banco:', error);
      throw error;
    }
  }

  /**
   * Testa o sistema de notificação de captura na aba atual
   */
  async testFloatingCapture() {
    try {
      // Obtém a aba ativa
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      
      if (tab) {
        // Executa script para testar o sistema de notificação
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          function: () => {
            if (window.buscalogoCaptureSystem) {
              // Força exibição da notificação para teste
              const captureSystem = window.buscalogoCaptureSystem;
              if (captureSystem && captureSystem.showCaptureNotification) {
                captureSystem.showCaptureNotification();
                console.log('🧪 Sistema de notificação testado via background script');
              }
            } else {
              console.log('❌ Sistema de notificação não encontrado na página');
            }
          }
        });
        
        console.log('✅ Teste do sistema de notificação executado na aba:', tab.url);
      }
      
    } catch (error) {
      console.error('❌ Erro ao testar sistema de notificação:', error);
      throw error;
    }
  }

  /**
   * Verifica se uma página já foi capturada
   */
  async checkPageCaptured(url) {
    try {
      console.log('🔍 BuscaLogo: checkPageCaptured chamado para URL:', url);
      console.log('🔍 BuscaLogo: this.db existe?', !!this.db);
      
      // Busca na base de dados local usando IndexedDB diretamente
      return new Promise((resolve, reject) => {
        if (!this.db) {
          console.log('🔍 BuscaLogo: IndexedDB não inicializado, retornando false');
          resolve(false);
          return;
        }
        
        console.log('🔍 BuscaLogo: IndexedDB inicializado, verificando stores disponíveis:', this.db.objectStoreNames);
        
        if (!this.db.objectStoreNames.contains('capturedPages')) {
          console.log('🔍 BuscaLogo: Store capturedPages não encontrada');
          resolve(false);
          return;
        }
        
        const transaction = this.db.transaction(['capturedPages'], 'readonly');
        const pagesStore = transaction.objectStore('capturedPages');
        const request = pagesStore.get(url);
        
        request.onsuccess = () => {
          const pageData = request.result;
          console.log('🔍 BuscaLogo: Resultado da busca:', pageData);
          
          if (pageData) {
            console.log('✅ BuscaLogo: Página já capturada:', url);
            resolve(true);
          } else {
            console.log('❌ BuscaLogo: Página não capturada:', url);
            resolve(false);
          }
        };
        
        request.onerror = () => {
          console.error('❌ BuscaLogo: Erro ao buscar página:', request.error);
          resolve(false);
        };
      });
      
    } catch (error) {
      console.error('❌ BuscaLogo: Erro ao verificar página capturada:', error);
      return false;
    }
  }

  /**
   * Salva dados da página no IndexedDB
   */
  async savePageDataToIndexedDB(pageData) {
    try {
      console.log('💾 Salvando dados da página no IndexedDB:', pageData.url);
      
      return new Promise((resolve, reject) => {
        if (!this.db) {
          reject(new Error('IndexedDB não inicializado'));
          return;
        }
        
        const transaction = this.db.transaction(['capturedPages', 'captureHistory'], 'readwrite');
        
        // Salva na store de páginas capturadas
        const pagesStore = transaction.objectStore('capturedPages');
        const pageRequest = pagesStore.put(pageData);
        
        pageRequest.onsuccess = () => {
          // Salva no histórico
          const historyStore = transaction.objectStore('captureHistory');
          const historyEntry = {
            timestamp: Date.now(),
            url: pageData.url,
            title: pageData.title,
            hostname: pageData.domain || pageData.hostname,
            action: 'captured'
          };
          
          const historyRequest = historyStore.put(historyEntry);
          historyRequest.onsuccess = () => {
            console.log('✅ Página salva com sucesso no IndexedDB');
            resolve(pageData);
          };
          
          historyRequest.onerror = () => {
            console.error('❌ Erro ao salvar no histórico:', historyRequest.error);
            reject(historyRequest.error);
          };
        };
        
        pageRequest.onerror = () => {
          console.error('❌ Erro ao salvar página:', pageRequest.error);
          reject(pageRequest.error);
        };
        
        transaction.onerror = () => {
          console.error('❌ Erro na transação:', transaction.error);
          reject(transaction.error);
        };
      });
      
    } catch (error) {
      console.error('❌ Erro ao salvar dados da página:', error);
      throw error;
    }
  }

  /**
   * Captura a página atual
   */
  async captureCurrentPage(data) {
    try {
      console.log('📥 Capturando página atual:', data.url);
      
      // Verifica se já foi capturada
      const existingPage = await this.checkPageCaptured(data.url);
      if (existingPage) {
        console.log('⚠️ Página já foi capturada anteriormente');
        return { success: true, message: 'Página já capturada', isNew: false };
      }
      
      // Coleta dados da página via content script
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab) {
        throw new Error('Aba ativa não encontrada');
      }
      
      // Executa script para coletar dados da página
      const results = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        function: () => {
          if (window.BuscaLogoCollectPageData) {
            return window.BuscaLogoCollectPageData();
          } else {
            // Fallback: coleta básica de dados
            return {
              meta: {
                title: document.title,
                description: document.querySelector('meta[name="description"]')?.content || '',
                url: window.location.href
              },
              headings: Array.from(document.querySelectorAll('h1, h2, h3')).map(h => ({
                level: h.tagName.toLowerCase(),
                text: h.textContent.trim()
              })).filter(h => h.text.length > 0),
              paragraphs: Array.from(document.querySelectorAll('p')).map(p => p.textContent.trim()).filter(p => p.length > 10),
              lists: [],
              links: Array.from(document.querySelectorAll('a[href]')).map(a => ({
                url: a.href,
                text: a.textContent.trim(),
                title: a.title || ''
              })).filter(l => l.text.length > 0 && l.url.startsWith('http')),
              contentAnalysis: {
                contentType: 'general',
                topics: [],
                entities: {},
                sentiment: 'neutral',
                readingLevel: 'intermediate',
                contentStructure: {}
              },
              terms: []
            };
          }
        }
      });
      
      if (!results || !results[0] || !results[0].result) {
        throw new Error('Falha ao coletar dados da página');
      }
      
      const pageData = results[0].result;
      
      // Adiciona metadados básicos
      pageData.url = data.url;
      pageData.title = data.title || pageData.meta?.title || document.title;
      pageData.domain = new URL(data.url).hostname;
      pageData.captured_at = new Date().toISOString();
      pageData.updated_at = new Date().toISOString();
      
      // Gera termos de busca se não existirem
      if (!pageData.terms || pageData.terms.length === 0) {
        pageData.terms = this.extractTermsFromTitle(pageData.title);
      }
      
      // Salva na base de dados usando IndexedDB diretamente
      await this.savePageDataToIndexedDB(pageData);
      
      // Atualiza estatísticas
      this.updateStats();
      
      console.log('✅ Página capturada com sucesso:', data.url);
      
      return { 
        success: true, 
        message: 'Página capturada com sucesso', 
        isNew: true,
        pageData 
      };
      
    } catch (error) {
      console.error('❌ Erro ao capturar página atual:', error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  }
}

// Inicializa a extensão
console.log('🚀 Criando instância do BuscaLogoBackground...');
const buscalogo = new BuscaLogoBackground();
console.log('✅ Instância criada:', buscalogo);

// Teste: verifica se a instância foi criada corretamente
setTimeout(() => {
  console.log('🧪 Teste de instância:');
  console.log('🧪 buscalogo existe:', !!buscalogo);
  console.log('🧪 buscalogo.setupMessageHandlers existe:', !!buscalogo.setupMessageHandlers);
  console.log('🧪 chrome.runtime existe:', !!chrome.runtime);
  console.log('🧪 chrome.runtime.onMessage existe:', !!chrome.runtime.onMessage);
}, 2000);

// Event listeners para lifecycle da extensão
chrome.runtime.onInstalled.addListener(() => {
  console.log('📦 BuscaLogo instalado/atualizado');
});

chrome.runtime.onStartup.addListener(() => {
  console.log('🚀 BuscaLogo iniciando com o Chrome');
});

// Handler para ativação do service worker
self.addEventListener('activate', (event) => {
  console.log('🔄 Service Worker ativado');
  event.waitUntil(
    Promise.resolve().then(() => {
      console.log('✅ Service Worker pronto para uso');
    })
  );
});

chrome.runtime.onSuspend.addListener(() => {
  console.log('⏸️ BuscaLogo suspenso');
});
