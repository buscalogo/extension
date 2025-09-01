/**
 * Content Script - BuscaLogo
 * 
 * Script que roda nas páginas web para coletar dados
 * quando solicitado pelo background script.
 * 
 * NOTA: A coleta agora é manual, não automática.
 */

(function() {
  'use strict';
  
  // Verifica se a API Chrome está disponível
  if (typeof chrome === 'undefined' || !chrome.runtime) {
    console.log('🔍 BuscaLogo: API Chrome não disponível nesta página');
    return;
  }
  
  console.log('🔍 BuscaLogo: Content script carregado');
  console.log('🔍 BuscaLogo: URL atual:', window.location.href);
  console.log('🔍 BuscaLogo: DOM ready state:', document.readyState);
  console.log('🔍 BuscaLogo: Timestamp:', new Date().toISOString());
  console.log('🔍 BuscaLogo: ==========================================');
  console.log('🔍 BuscaLogo: INICIALIZAÇÃO DO CONTENT SCRIPT');
  console.log('🔍 BuscaLogo: ==========================================');
  
  // Inicializa o sistema de notificação de captura quando o DOM estiver pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCaptureNotificationSystem);
  } else {
    // DOM já está pronto, inicializa com delay
    setTimeout(initCaptureNotificationSystem, 100);
  }
  
  // Injeta CSS imediatamente para garantir que os estilos estejam disponíveis
  injectCaptureStyles();
  
  // Força verificação da página após um tempo para garantir que apareça
  setTimeout(() => {
    if (window.buscalogoCaptureSystem) {
      console.log('🎯 BuscaLogo: Forçando verificação da página após delay...');
      window.buscalogoCaptureSystem.checkCurrentPage();
    }
  }, 4000);
  
  // Teste direto de comunicação com o background script
  setTimeout(() => {
    testBackgroundCommunication();
  }, 5000);
  
  // Teste direto da verificação de página
  setTimeout(() => {
    testPageVerification();
  }, 7000);
  
  // Teste direto da captura de URL
  setTimeout(() => {
    testUrlCapture();
  }, 9000);
  
  // Teste direto de envio de mensagem
  setTimeout(() => {
    testDirectMessage();
  }, 11000);
  
  async function testBackgroundCommunication() {
    try {
      console.log('🧪 BuscaLogo: Testando comunicação com background script...');
      
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
        const testResponse = await new Promise((resolve, reject) => {
          chrome.runtime.sendMessage({ type: 'TEST_DATABASE' }, (response) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else {
              resolve(response);
            }
          });
        });
        
        console.log('🧪 BuscaLogo: Teste de comunicação bem-sucedido:', testResponse);
      } else {
        console.log('🧪 BuscaLogo: Chrome runtime não disponível para teste');
      }
    } catch (error) {
      console.error('🧪 BuscaLogo: Erro no teste de comunicação:', error);
    }
  }
  
  async function testPageVerification() {
    try {
      console.log('🧪 BuscaLogo: Testando verificação de página...');
      console.log('🧪 BuscaLogo: window.location.href:', window.location.href);
      console.log('🧪 BuscaLogo: Tipo da URL:', typeof window.location.href);
      
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
        const testResponse = await new Promise((resolve, reject) => {
          const testUrl = window.location.href;
          console.log('🧪 BuscaLogo: Enviando teste com URL:', testUrl);
          
          chrome.runtime.sendMessage({ 
            type: 'CHECK_PAGE_CAPTURED', 
            data: { url: testUrl } 
          }, (response) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else {
              resolve(response);
            }
          });
        });
        
        console.log('🧪 BuscaLogo: Teste de verificação bem-sucedido:', testResponse);
      } else {
        console.log('🧪 BuscaLogo: Chrome runtime não disponível para teste');
      }
    } catch (error) {
      console.error('🧪 BuscaLogo: Erro no teste de verificação:', error);
    }
  }
  
  function testUrlCapture() {
    try {
      console.log('🧪 BuscaLogo: Testando captura de URL...');
      console.log('🧪 BuscaLogo: window.location:', window.location);
      console.log('🧪 BuscaLogo: window.location.href:', window.location.href);
      console.log('🧪 BuscaLogo: window.location.toString():', window.location.toString());
      console.log('🧪 BuscaLogo: window.location.origin:', window.location.origin);
      console.log('🧪 BuscaLogo: window.location.pathname:', window.location.pathname);
      console.log('🧪 BuscaLogo: document.URL:', document.URL);
      console.log('🧪 BuscaLogo: document.location.href:', document.location.href);
      
      // Testa diferentes formas de capturar a URL
      const urls = [
        window.location.href,
        window.location.toString(),
        document.URL,
        document.location.href,
        window.location.origin + window.location.pathname + window.location.search
      ];
      
      urls.forEach((url, index) => {
        console.log(`🧪 BuscaLogo: URL ${index}:`, url);
        console.log(`🧪 BuscaLogo: Tipo da URL ${index}:`, typeof url);
        console.log(`🧪 BuscaLogo: URL ${index} é válida:`, url && url.length > 0);
      });
      
    } catch (error) {
      console.error('🧪 BuscaLogo: Erro no teste de captura de URL:', error);
    }
  }
  
  async function testDirectMessage() {
    try {
      console.log('🧪 BuscaLogo: Testando mensagem direta...');
      
      if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
        // Teste 1: Mensagem simples
        console.log('🧪 BuscaLogo: Teste 1 - Mensagem simples');
        const testUrl = window.location.href;
        console.log('🧪 BuscaLogo: URL para teste:', testUrl);
        
        const message1 = {
          type: 'CHECK_PAGE_CAPTURED',
          data: { url: testUrl }
        };
        console.log('🧪 BuscaLogo: Mensagem 1 sendo enviada:', message1);
        
        const response1 = await new Promise((resolve, reject) => {
          chrome.runtime.sendMessage(message1, (response) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else {
              resolve(response);
            }
          });
        });
        
        console.log('🧪 BuscaLogo: Resposta 1 recebida:', response1);
        
        // Teste 2: Mensagem com estrutura diferente
        console.log('🧪 BuscaLogo: Teste 2 - Estrutura diferente');
        const message2 = {
          type: 'CHECK_PAGE_CAPTURED',
          data: testUrl
        };
        console.log('🧪 BuscaLogo: Mensagem 2 sendo enviada:', message2);
        
        const response2 = await new Promise((resolve, reject) => {
          chrome.runtime.sendMessage(message2, (response) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else {
              resolve(response);
            }
          });
        });
        
        console.log('🧪 BuscaLogo: Resposta 2 recebida:', response2);
        
      } else {
        console.log('🧪 BuscaLogo: Chrome runtime não disponível para teste');
      }
    } catch (error) {
      console.error('🧪 BuscaLogo: Erro no teste de mensagem direta:', error);
    }
  }
  
  // Debug: verifica se o content script está rodando
  console.log('🔍 BuscaLogo: Content script carregado e inicializando...');
  console.log('🔍 BuscaLogo: DOM ready state:', document.readyState);
  console.log('🔍 BuscaLogo: URL atual:', window.location.href);
  

  
  // Função que será chamada pelo background script para coletar dados
  // Esta função é injetada via chrome.scripting.executeScript
  window.BuscaLogoCollectPageData = function() {
    try {
      const pageData = {
        meta: extractMetaData(),
        headings: extractHeadings(),
        paragraphs: extractParagraphs(),
        lists: extractLists(),
        links: extractLinks(),
        contentAnalysis: analyzeContent(),
        terms: []
      };
      pageData.terms = generateSearchTerms(pageData);
      console.log('🔍 BuscaLogo: Dados da página coletados manualmente');
      return pageData;
    } catch (error) {
      console.error('❌ BuscaLogo: Erro ao coletar dados da página:', error);
      return null;
    }
  };
  

  
  /**
   * Injeta estilos CSS para o sistema de notificação
   */
  function injectCaptureStyles() {
    try {
      // Verifica se já foi injetado
      if (document.getElementById('buscalogo-capture-styles')) {
        return;
      }
      
      const style = document.createElement('style');
      style.id = 'buscalogo-capture-styles';
      style.textContent = `
        /* Sistema de Notificação Visual - BuscaLogo */
        .buscalogo-capture-notification {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 999999;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 16px 20px;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 14px;
          cursor: pointer;
          transition: all 0.3s ease;
          max-width: 320px;
          min-width: 280px;
          animation: buscalogo-slide-in 0.5s ease-out;
        }
        
        .buscalogo-capture-notification:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 25px rgba(0, 0, 0, 0.4);
        }
        
        .buscalogo-capture-notification.capturing {
          background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%);
          pointer-events: none;
        }
        
        .buscalogo-capture-notification.already-captured {
          background: linear-gradient(135deg, #9E9E9E 0%, #757575 100%);
          pointer-events: none;
        }
        
        .buscalogo-capture-notification.hidden {
          opacity: 0;
          transform: translateX(100px);
          pointer-events: none;
        }
        
        .buscalogo-capture-content {
          display: flex;
          align-items: center;
          gap: 12px;
        }
        
        .buscalogo-capture-icon {
          font-size: 20px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
        }
        
        .buscalogo-capture-text {
          flex: 1;
          line-height: 1.4;
          min-width: 0;
        }
        
        .notification-title {
          font-weight: 600;
          font-size: 14px;
          margin-bottom: 4px;
          line-height: 1.2;
        }
        
        .notification-message {
          font-size: 12px;
          opacity: 0.9;
          line-height: 1.3;
        }
        
        .buscalogo-capture-close {
          background: rgba(255, 255, 255, 0.2);
          border: none;
          color: white;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          cursor: pointer;
          font-size: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          transition: background 0.2s ease;
          font-weight: bold;
        }
        
        .buscalogo-capture-close:hover {
          background: rgba(255, 255, 255, 0.3);
        }
        
        @keyframes buscalogo-slide-in {
          from {
            opacity: 0;
            transform: translateX(100px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }
        
        @keyframes buscalogo-fade-out {
          0%, 80% { opacity: 1; transform: translateX(0); }
          100% { opacity: 0; transform: translateX(100px); }
        }
        
        .buscalogo-capture-notification.auto-hide {
          animation: buscalogo-fade-out 5s forwards;
        }
        
        /* Responsividade */
        @media (max-width: 768px) {
          .buscalogo-capture-notification {
            top: 10px;
            right: 10px;
            left: 10px;
            max-width: none;
            min-width: auto;
            font-size: 13px;
          }
        }
      `;
      
      document.head.appendChild(style);
      console.log('🎯 BuscaLogo: Estilos CSS injetados');
      
    } catch (error) {
      console.error('❌ BuscaLogo: Erro ao injetar estilos:', error);
    }
  }
  
  /**
   * Inicializa o sistema de notificação de captura
   */
  function initCaptureNotificationSystem() {
    try {
      console.log('🎯 BuscaLogo: Iniciando initCaptureNotificationSystem...');
      
      // Verifica se já foi inicializado
      if (window.buscalogoCaptureSystem) {
        console.log('🎯 BuscaLogo: Sistema já inicializado, retornando...');
        return;
      }
      
      console.log('🎯 BuscaLogo: Criando novo sistema de notificação...');
      
      // Cria o sistema de notificação
      const captureSystem = {
        isInitialized: false,
        currentUrl: '',
        notificationElement: null,
        autoHideTimer: null,
        settings: {
          enabled: true,
          autoHide: true,
          hideDelay: 8000
        },
        
        init() {
          if (this.isInitialized) return;
          
          console.log('🎯 BuscaLogo: Inicializando sistema de captura...');
          
          // Carrega configurações
          this.loadSettings();
          
          // Configura observador de mudanças de URL
          this.setupUrlObserver();
          
          // Verifica página atual com delay para garantir que tudo esteja pronto
          setTimeout(() => {
            console.log('🎯 BuscaLogo: Verificando página atual após inicialização...');
            this.checkCurrentPage();
          }, 2000);
          
          this.isInitialized = true;
          console.log('✅ BuscaLogo: Sistema de captura inicializado');
          
          // Carrega configurações de forma assíncrona depois
          this.loadSettingsAsync();
        },
        
        async loadSettingsAsync() {
          try {
            console.log('🎯 BuscaLogo: Carregando configurações de forma assíncrona...');
            if (typeof chrome !== 'undefined' && chrome.storage) {
              const result = await chrome.storage.local.get(['floatingCaptureSettings']);
              if (result.floatingCaptureSettings) {
                this.settings = { ...this.settings, ...result.floatingCaptureSettings };
                console.log('🎯 BuscaLogo: Configurações carregadas:', this.settings);
              }
            }
          } catch (error) {
            console.warn('⚠️ BuscaLogo: Erro ao carregar configurações assíncronas:', error);
          }
        },
        
        loadSettings() {
          try {
            console.log('🎯 BuscaLogo: Carregando configurações...');
            // Por enquanto usa configurações padrão
            // As configurações serão carregadas de forma assíncrona depois
            console.log('🎯 BuscaLogo: Configurações padrão aplicadas:', this.settings);
          } catch (error) {
            console.warn('⚠️ BuscaLogo: Erro ao carregar configurações, usando padrões');
          }
        },
        
        setupUrlObserver() {
          // Debounced para evitar múltiplas execuções
          const debouncedCheck = () => {
            setTimeout(() => {
              this.checkCurrentPage();
            }, 300);
          };
          
          // Observa mudanças na URL
          let currentUrl = window.location.href;
          const observer = new MutationObserver(() => {
            if (window.location.href !== currentUrl) {
              currentUrl = window.location.href;
              debouncedCheck();
            }
          });
          
          // Observa mudanças no body (para SPAs)
          observer.observe(document.body, {
            childList: true,
            subtree: true
          });
          
          // Também escuta eventos de navegação
          window.addEventListener('popstate', debouncedCheck);
          window.addEventListener('pushstate', debouncedCheck);
          window.addEventListener('replacestate', debouncedCheck);
        },
        
        async checkCurrentPage() {
          console.log('🎯 BuscaLogo: checkCurrentPage chamado');
          console.log('🎯 BuscaLogo: isInitialized:', this.isInitialized);
          console.log('🎯 BuscaLogo: settings.enabled:', this.settings.enabled);
          
          if (!this.settings.enabled) {
            console.log('🎯 BuscaLogo: Sistema desabilitado, retornando...');
            return;
          }
          
          try {
            const url = window.location.href;
            console.log('🎯 BuscaLogo: Verificando URL:', url);
            console.log('🎯 BuscaLogo: Tipo da URL capturada:', typeof url);
            console.log('🎯 BuscaLogo: URL capturada é válida?', url && url.length > 0);
            
            // Verifica se a URL é válida
            if (!url || url.length === 0) {
              console.error('🎯 BuscaLogo: URL inválida capturada:', url);
              return;
            }
            
            // Evita verificar a mesma URL
            if (url === this.currentUrl) {
              console.log('🎯 BuscaLogo: Mesma URL, retornando...');
              return;
            }
            this.currentUrl = url;
            
            // Verifica se é uma página válida
            if (!this.isValidPage(url)) {
              console.log('🎯 BuscaLogo: URL inválida, ocultando notificação...');
              this.hideNotification();
              return;
            }
            
            console.log('🎯 BuscaLogo: URL válida, verificando status...');
            console.log('🎯 BuscaLogo: Chamando checkPageStatus com URL:', url);
            // Verifica se já foi capturada
            await this.checkPageStatus(url);
            
          } catch (error) {
            console.warn('⚠️ BuscaLogo: Erro ao verificar página:', error);
          }
        },
        
        isValidPage(url) {
          try {
            const urlObj = new URL(url);
            return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
          } catch {
            return false;
          }
        },
        
        async checkPageStatus(url) {
          try {
            console.log('🎯 BuscaLogo: checkPageStatus chamado para URL:', url);
            console.log('🎯 BuscaLogo: Tipo da URL:', typeof url);
            console.log('🎯 BuscaLogo: URL é válida?', url && url.length > 0);
            
            // Verifica se a URL é válida
            if (!url || url.length === 0) {
              console.error('🎯 BuscaLogo: URL inválida recebida:', url);
              return;
            }
            
            // Envia mensagem para verificar se já foi capturada
            console.log('🎯 BuscaLogo: Enviando mensagem CHECK_PAGE_CAPTURED...');
            const messageData = { url: url };
            console.log('🎯 BuscaLogo: Dados da mensagem:', messageData);
            console.log('🎯 BuscaLogo: messageData.url:', messageData.url);
            console.log('🎯 BuscaLogo: Tipo de messageData.url:', typeof messageData.url);
            console.log('🎯 BuscaLogo: messageData.url.length:', messageData.url?.length);
            const response = await this.sendMessage('CHECK_PAGE_CAPTURED', messageData);
            
            console.log('🎯 BuscaLogo: Resposta recebida:', response);
            console.log('🎯 BuscaLogo: Tipo da resposta:', typeof response);
            console.log('🎯 BuscaLogo: response.success:', response?.success);
            console.log('🎯 BuscaLogo: response.isCaptured:', response?.isCaptured);
            console.log('🎯 BuscaLogo: response.isCaptured === true?', response?.isCaptured === true);
            console.log('🎯 BuscaLogo: response.isCaptured === false?', response?.isCaptured === false);
            
            if (response && response.success) {
              if (response.isCaptured === true) {
                console.log('🎯 BuscaLogo: Página já capturada, verificando configuração...');
                // Verifica se deve mostrar notificação de página já capturada
                if (response.showAlreadyCaptured === true) {
                  console.log('🎯 BuscaLogo: Configuração permite mostrar notificação de já capturada');
                  this.showAlreadyCapturedNotification();
                } else {
                  console.log('🎯 BuscaLogo: Configuração desabilita notificação de já capturada - não mostrando nada');
                }
              } else if (response.isCaptured === false) {
                console.log('🎯 BuscaLogo: Página não capturada, verificando configuração...');
                // Verifica se deve mostrar notificação de página não capturada
                if (response.showNotCaptured === true) {
                  console.log('🎯 BuscaLogo: Configuração permite mostrar notificação de não capturada');
                  this.showCaptureNotification();
                } else {
                  console.log('🎯 BuscaLogo: Configuração desabilita notificação de não capturada - não mostrando nada');
                }
              } else {
                console.log('🎯 BuscaLogo: Resposta ambígua, response.isCaptured =', response.isCaptured);
                console.log('🎯 BuscaLogo: Mostrando notificação por padrão...');
                this.showCaptureNotification();
              }
            } else {
              console.log('🎯 BuscaLogo: Resposta inválida, response =', response);
              console.log('🎯 BuscaLogo: Mostrando notificação por padrão...');
              // Se não conseguir verificar, mostra por padrão
              this.showCaptureNotification();
            }
            
          } catch (error) {
            console.warn('⚠️ BuscaLogo: Erro ao verificar status da página:', error);
            console.log('🎯 BuscaLogo: Em caso de erro, mostrando notificação por padrão...');
            // Em caso de erro, mostra a notificação
            this.showCaptureNotification();
          }
        },
        
        showCaptureNotification() {
          console.log('🎯 BuscaLogo: showCaptureNotification chamado');
          this.createNotification(
            '🔍 Página não capturada',
            'Clique para adicionar ao sistema de busca',
            'capture'
          );
        },
        
        showAlreadyCapturedNotification() {
          console.log('🎯 BuscaLogo: showAlreadyCapturedNotification chamado');
          this.createNotification(
            '✅ Página já capturada',
            'Esta página já está no sistema de busca',
            'already-captured'
          );
        },
        
        createNotification(title, message, type = 'capture') {
          try {
            console.log('🎯 BuscaLogo: createNotification chamado com:', title, message, type);
            
            // Remove notificação existente
            this.hideNotification();
            
            // Cria elemento de notificação
            const notification = document.createElement('div');
            notification.className = `buscalogo-capture-notification ${type}`;
            notification.id = 'buscalogo-capture-notification';
            
            notification.innerHTML = `
              <div class="buscalogo-capture-content">
                <span class="buscalogo-capture-icon">${type === 'capture' ? '🔍' : '✅'}</span>
                <div class="buscalogo-capture-text">
                  <div class="notification-title">${title}</div>
                  <div class="notification-message">${message}</div>
                </div>
                <button class="buscalogo-capture-close" onclick="this.parentElement.parentElement.remove()">×</button>
              </div>
            `;
            
            // Adiciona event listeners
            if (type === 'capture') {
              notification.addEventListener('click', (e) => {
                if (!e.target.classList.contains('buscalogo-capture-close')) {
                  this.handleCaptureClick();
                }
              });
            }
            
            // Adiciona ao DOM
            console.log('🎯 BuscaLogo: Adicionando notificação ao DOM...');
            document.body.appendChild(notification);
            this.notificationElement = notification;
            
            // Auto-hide se configurado
            if (this.settings.autoHide) {
              this.startAutoHide();
            }
            
            console.log('✅ BuscaLogo: Notificação criada e exibida com sucesso');
            
          } catch (error) {
            console.error('❌ BuscaLogo: Erro ao criar notificação:', error);
          }
        },
        
        hideNotification() {
          if (this.notificationElement && this.notificationElement.parentNode) {
            this.notificationElement.remove();
            this.notificationElement = null;
          }
          this.stopAutoHide();
        },
        
        startAutoHide() {
          this.stopAutoHide();
          
          this.autoHideTimer = setTimeout(() => {
            if (this.notificationElement && this.settings.autoHide) {
              this.notificationElement.classList.add('auto-hide');
              setTimeout(() => {
                this.hideNotification();
              }, 5000);
            }
          }, this.settings.hideDelay);
        },
        
        stopAutoHide() {
          if (this.autoHideTimer) {
            clearTimeout(this.autoHideTimer);
            this.autoHideTimer = null;
          }
        },
        
        async handleCaptureClick() {
          try {
            console.log('🎯 BuscaLogo: handleCaptureClick chamado');
            
            // Mostra estado de capturando
            this.notificationElement.classList.add('capturing');
            this.notificationElement.querySelector('.buscalogo-capture-text').innerHTML = `
              <div class="notification-title">⏳ Capturando...</div>
              <div class="notification-message">Aguarde um momento</div>
            `;
            
            // Envia comando de captura
            const response = await this.sendMessage('CAPTURE_CURRENT_PAGE', {
              url: window.location.href,
              title: document.title
            });
            
            if (response && response.success) {
              // Sucesso - mostra como já capturado
              this.notificationElement.classList.remove('capturing');
              this.showAlreadyCapturedNotification();
              
              // Notifica sucesso
              this.showSuccessMessage('✅ Página capturada com sucesso!');
              
            } else {
              throw new Error(response?.error || 'Erro desconhecido');
            }
            
          } catch (error) {
            console.error('❌ BuscaLogo: Erro ao capturar página:', error);
            
            // Restaura notificação
            this.showCaptureNotification();
            
            // Notifica erro
            this.showErrorMessage('❌ Erro ao capturar página: ' + error.message);
          }
        },
        
        showSuccessMessage(message) {
          this.showTemporaryMessage(message, 'success');
        },
        
        showErrorMessage(message) {
          this.showTemporaryMessage(message, 'error');
        },
        
        showTemporaryMessage(message, type = 'info') {
          try {
            const tempNotification = document.createElement('div');
            tempNotification.style.cssText = `
              position: fixed;
              top: 80px;
              right: 20px;
              background: ${type === 'success' ? 'rgba(76, 175, 80, 0.9)' : 'rgba(244, 67, 54, 0.9)'};
              color: white;
              padding: 12px 16px;
              border-radius: 6px;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
              font-size: 14px;
              z-index: 999998;
              animation: buscalogo-slide-in 0.3s ease-out;
            `;
            tempNotification.textContent = message;
            
            document.body.appendChild(tempNotification);
            
            // Remove após 3 segundos
            setTimeout(() => {
              if (tempNotification.parentNode) {
                tempNotification.remove();
              }
            }, 3000);
            
          } catch (error) {
            console.warn('⚠️ BuscaLogo: Erro ao mostrar mensagem temporária:', error);
          }
        },
        
        async sendMessage(type, data = {}) {
          try {
            console.log('🎯 BuscaLogo: sendMessage chamado com tipo:', type, 'e dados:', data);
            console.log('🎯 BuscaLogo: chrome disponível:', typeof chrome !== 'undefined');
            console.log('🎯 BuscaLogo: chrome.runtime disponível:', typeof chrome !== 'undefined' && chrome.runtime);
            console.log('🎯 BuscaLogo: chrome.runtime.sendMessage disponível:', typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage);
            
            return new Promise((resolve, reject) => {
              if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
                console.log('🎯 BuscaLogo: Enviando mensagem para background script...');
                const message = { type, data };
                console.log('🎯 BuscaLogo: Mensagem sendo enviada:', message);
                console.log('🎯 BuscaLogo: message.type:', message.type);
                console.log('🎯 BuscaLogo: message.data:', message.data);
                console.log('🎯 BuscaLogo: message.data.url:', message.data?.url);
                
                chrome.runtime.sendMessage(message, (response) => {
                  console.log('🎯 BuscaLogo: Callback recebido, response:', response);
                  console.log('🎯 BuscaLogo: chrome.runtime.lastError:', chrome.runtime.lastError);
                  
                  if (chrome.runtime.lastError) {
                    console.error('🎯 BuscaLogo: Erro do runtime:', chrome.runtime.lastError);
                    reject(new Error(chrome.runtime.lastError.message));
                  } else {
                    console.log('🎯 BuscaLogo: Mensagem enviada com sucesso, resolvendo...');
                    resolve(response);
                  }
                });
              } else {
                console.error('🎯 BuscaLogo: Chrome runtime não disponível');
                reject(new Error('Chrome runtime não disponível'));
              }
            });
          } catch (error) {
            console.error('🎯 BuscaLogo: Erro ao enviar mensagem:', error);
            throw new Error('Erro ao enviar mensagem: ' + error.message);
          }
        }
      };
      
      // Disponibiliza globalmente
      window.buscalogoCaptureSystem = captureSystem;
      
      // Inicializa
      captureSystem.init();
      
    } catch (error) {
      console.error('❌ BuscaLogo: Erro ao inicializar sistema de captura:', error);
    }
  }
  
  /**
   * Extrai metadados da página
   */
  function extractMetaData() {
    const meta = {};
    
    try {
      const metaTags = document.querySelectorAll('meta');
      metaTags.forEach(tag => {
        const name = tag.getAttribute('name') || tag.getAttribute('property');
        const content = tag.getAttribute('content');
        if (name && content) {
          meta[name] = content;
        }
      });
    } catch (error) {
      console.warn('⚠️ BuscaLogo: Erro ao extrair metadados:', error);
    }
    
    return meta;
  }
  
  /**
   * Extrai headings (h1, h2, h3) da página
   */
  function extractHeadings() {
    const headings = [];
    
    try {
      const headingElements = document.querySelectorAll('h1, h2, h3');
      headingElements.forEach(heading => {
        const text = heading.textContent?.trim();
        if (text && text.length > 0) {
          headings.push({
            level: heading.tagName.toLowerCase(),
            text: text
          });
        }
      });
    } catch (error) {
      console.warn('⚠️ BuscaLogo: Erro ao extrair headings:', error);
    }
    
    return headings;
  }
  
  /**
   * Extrai parágrafos da página
   */
  function extractParagraphs() {
    const paragraphs = [];
    
    try {
      const pElements = document.querySelectorAll('p');
      pElements.forEach(p => {
        const text = p.textContent?.trim();
        if (text && text.length > 10) { // Ignora parágrafos muito curtos
          paragraphs.push(text);
        }
      });
    } catch (error) {
      console.warn('⚠️ BuscaLogo: Erro ao extrair parágrafos:', error);
    }
    
    return paragraphs;
  }
  
  /**
   * Extrai listas da página
   */
  function extractLists() {
    const lists = [];
    
    try {
      const listElements = document.querySelectorAll('ul, ol');
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
          lists.push({
            type: list.tagName.toLowerCase(),
            items: items
          });
        }
      });
    } catch (error) {
      console.warn('⚠️ BuscaLogo: Erro ao extrair listas:', error);
    }
    
    return lists;
  }
  
  /**
   * Extrai links relevantes da página
   */
  function extractLinks() {
    try {
      const links = [];
      const linkElements = document.querySelectorAll('a[href]');
      
      linkElements.forEach(link => {
        const href = link.getAttribute('href');
        const text = link.textContent?.trim();
        const title = link.getAttribute('title');
        const rel = link.getAttribute('rel');
        
        // Filtra links relevantes
        if (href && text && text.length > 0 && !isInternalNavigation(href, text)) {
          const linkData = {
            url: href,
            text: text,
            title: title || '',
            rel: rel || '',
            type: classifyLink(href, text, rel),
            relevance: calculateLinkRelevance(href, text, rel)
          };
          
          // Só adiciona links com relevância mínima
          if (linkData.relevance > 0.3) {
            links.push(linkData);
          }
        }
      });
      
      // Ordena por relevância e limita a 50 links
      links.sort((a, b) => b.relevance - a.relevance);
      return links.slice(0, 50);
      
    } catch (error) {
      console.error('❌ Erro ao extrair links:', error);
      return [];
    }
  }
  
  /**
   * Verifica se é link de navegação interna
   */
  function isInternalNavigation(href, text) {
    const internalPatterns = [
      /^#/, // Âncoras
      /^javascript:/, // JavaScript
      /^mailto:/, // Email
      /^tel:/, // Telefone
      /^(home|início|sobre|contato|login|cadastro|menu|navegação)$/i, // Navegação comum
      /^(próxima|anterior|voltar|avançar|primeira|última)$/i, // Paginação
      /^(gerar link|facebook|x|pinterest|e-mail|outros aplicativos)$/i, // Botões sociais
      /^(postagens|arquivos|doação|inscreva-se|grupos)$/i // Seções do blog
    ];
    
    return internalPatterns.some(pattern => 
      pattern.test(href) || pattern.test(text.toLowerCase())
    );
  }
  
  /**
   * Classifica o tipo de link
   */
  function classifyLink(href, text, rel) {
    const url = href.toLowerCase();
    const textLower = text.toLowerCase();
    
    // Links de notícias/artigos (prioridade alta)
    if (textLower.includes('leia mais') || textLower.includes('ler mais') || 
        textLower.includes('continue lendo') || textLower.includes('saiba mais') ||
        textLower.includes('lançado') || textLower.includes('lançada') ||
        textLower.includes('como instalar') || textLower.includes('como fazer') ||
        textLower.includes('tutorial') || textLower.includes('dica') ||
        textLower.includes('guia') || textLower.includes('review') ||
        textLower.includes('novo') || textLower.includes('nova') ||
        textLower.includes('atualização') || textLower.includes('correção') ||
        textLower.includes('disponível') || textLower.includes('chegou')) {
      return 'article';
    }
    
    // Links de categoria
    if (textLower.includes('categoria') || textLower.includes('tag') || 
        textLower.includes('seção') || textLower.includes('rubrica') ||
        textLower.includes('distro') || textLower.includes('distribuição')) {
      return 'category';
    }
    
    // Links de autor
    if (textLower.includes('por') || textLower.includes('autor') || 
        textLower.includes('escrito por') || textLower.includes('redator') ||
        textLower.includes('lobo')) {
      return 'author';
    }
    
    // Links de data
    if (textLower.includes('data') || textLower.includes('publicado') || 
        textLower.includes('atualizado') || /\d{1,2}\/\d{1,2}\/\d{4}/.test(text) ||
        textLower.includes('setembro') || textLower.includes('março') ||
        textLower.includes('fevereiro') || textLower.includes('janeiro')) {
      return 'date';
    }
    
    // Links externos
    if (url.startsWith('http') && !url.includes(window.location.hostname)) {
      return 'external';
    }
    
    // Links internos
    if (url.startsWith('/') || url.startsWith('./') || url.includes(window.location.hostname)) {
      return 'internal';
    }
    
    return 'general';
  }
  
  /**
   * Calcula relevância do link
   */
  function calculateLinkRelevance(href, text, rel) {
    let relevance = 0.5; // Base
    
    // Texto mais longo = mais relevante
    if (text.length > 20) relevance += 0.2;
    if (text.length > 50) relevance += 0.1;
    
    // Tipos específicos são mais relevantes
    const type = classifyLink(href, text, rel);
    if (type === 'article') relevance += 0.4; // Aumentado para artigos
    if (type === 'category') relevance += 0.2;
    if (type === 'author') relevance += 0.2;
    
    // Links com palavras-chave específicas são mais relevantes
    const relevantKeywords = [
      'linux', 'ubuntu', 'debian', 'fedora', 'arch', 'gentoo',
      'gnome', 'kde', 'plasma', 'desktop', 'sistema',
      'instalar', 'configurar', 'tutorial', 'dica', 'guia',
      'lançado', 'disponível', 'novo', 'atualização'
    ];
    
    relevantKeywords.forEach(keyword => {
      if (text.toLowerCase().includes(keyword)) {
        relevance += 0.1;
      }
    });
    
    // Links com title são mais relevantes
    if (rel && rel.includes('nofollow')) relevance -= 0.1;
    
    // Links muito curtos são menos relevantes
    if (text.length < 5) relevance -= 0.2;
    
    return Math.max(0, Math.min(1, relevance));
  }
  
  /**
   * Gera termos únicos para busca baseados no conteúdo da página
   */
  function generateSearchTerms(pageData) {
    try {
      // Combina todo o texto relevante
      const allText = [
        pageData.title,
        pageData.meta.description || '',
        ...pageData.headings.map(h => h.text),
        ...pageData.paragraphs,
        ...pageData.lists.flatMap(list => list.items)
      ].join(' ').toLowerCase();
      
      // Remove HTML tags e caracteres especiais
      const cleanText = allText
        .replace(/<[^>]*>/g, ' ')
        .replace(/[^\w\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      // Divide em palavras e filtra
      const words = cleanText.split(/\s+/)
        .filter(word => word.length > 3) // Palavras com mais de 3 caracteres
        .filter(word => !isCommonWord(word)) // Remove palavras comuns
        .filter(word => /^[a-záàâãéèêíìîóòôõúùûç]+$/i.test(word)); // Apenas palavras
      
      // Remove duplicatas e limita a 50 termos
      return [...new Set(words)].slice(0, 50);
      
    } catch (error) {
      console.warn('⚠️ BuscaLogo: Erro ao gerar termos de busca:', error);
      return [];
    }
  }
  
  /**
   * Verifica se uma palavra é comum (stop words em português)
   */
  function isCommonWord(word) {
    const commonWords = [
      'para', 'com', 'uma', 'por', 'mais', 'como', 'mas', 'foi', 'ele', 'se',
      'tem', 'à', 'seu', 'sua', 'ou', 'ser', 'quando', 'muito', 'há', 'nos',
      'já', 'está', 'eu', 'também', 'só', 'pelo', 'pela', 'até', 'isso', 'ela',
      'entre', 'era', 'depois', 'sem', 'mesmo', 'aos', 'ter', 'seus', 'suas',
      'sua', 'ou', 'ser', 'quando', 'muito', 'há', 'nos', 'já', 'está', 'eu',
      'também', 'só', 'pelo', 'pela', 'até', 'isso', 'ela', 'entre', 'era',
      'depois', 'sem', 'mesmo', 'aos', 'ter', 'seus', 'suas', 'sua', 'ou',
      'ser', 'quando', 'muito', 'há', 'nos', 'já', 'está', 'eu', 'também',
      'só', 'pelo', 'pela', 'até', 'isso', 'ela', 'entre', 'era', 'depois'
    ];
    
    return commonWords.includes(word.toLowerCase());
  }
  
  /**
   * Analisa o conteúdo da página para descoberta
   */
  function analyzeContent() {
    try {
      const analysis = {
        contentType: detectContentType(),
        topics: extractTopics(),
        entities: extractEntities(),
        sentiment: analyzeSentiment(),
        readingLevel: calculateReadingLevel(),
        contentStructure: analyzeContentStructure()
      };
      
      return analysis;
    } catch (error) {
      console.error('❌ Erro ao analisar conteúdo:', error);
      return {};
    }
  }
  
  /**
   * Detecta o tipo de conteúdo da página
   */
  function detectContentType() {
    const url = window.location.href.toLowerCase();
    const title = document.title.toLowerCase();
    const headings = Array.from(document.querySelectorAll('h1, h2, h3'))
      .map(h => h.textContent.toLowerCase())
      .join(' ');
    
    // Notícias
    if (url.includes('/noticias/') || url.includes('/news/') || 
        title.includes('notícia') || title.includes('news') ||
        headings.includes('notícia') || headings.includes('news')) {
      return 'news';
    }
    
    // Artigos/Blog
    if (url.includes('/artigo/') || url.includes('/blog/') || url.includes('/post/') ||
        title.includes('artigo') || title.includes('blog') || title.includes('post')) {
      return 'article';
    }
    
    // Páginas de produto
    if (url.includes('/produto/') || url.includes('/product/') ||
        headings.includes('preço') || headings.includes('comprar') ||
        document.querySelector('[data-product]')) {
      return 'product';
    }
    
    // Páginas de categoria
    if (url.includes('/categoria/') || url.includes('/category/') ||
        headings.includes('categoria') || headings.includes('categoria')) {
      return 'category';
    }
    
    // Páginas institucionais
    if (url.includes('/sobre/') || url.includes('/about/') ||
        url.includes('/contato/') || url.includes('/contact/')) {
      return 'institutional';
    }
    
    return 'general';
  }
  
  /**
   * Extrai tópicos principais do conteúdo
   */
  function extractTopics() {
    const topics = new Set();
    const text = document.body.textContent.toLowerCase();
    
    // Tópicos comuns em tecnologia
    const techTopics = [
      'linux', 'ubuntu', 'debian', 'fedora', 'arch', 'gentoo',
      'programação', 'desenvolvimento', 'software', 'hardware',
      'inteligência artificial', 'machine learning', 'data science',
      'web development', 'mobile', 'cloud', 'devops', 'cybersecurity'
    ];
    
    techTopics.forEach(topic => {
      if (text.includes(topic.toLowerCase())) {
        topics.add(topic);
      }
    });
    
    // Tópicos baseados em headings
    const headingTopics = Array.from(document.querySelectorAll('h1, h2, h3'))
      .map(h => h.textContent.trim())
      .filter(text => text.length > 5 && text.length < 100)
      .slice(0, 10);
    
    headingTopics.forEach(topic => topics.add(topic));
    
    return Array.from(topics);
  }
  
  /**
   * Extrai entidades nomeadas (pessoas, lugares, organizações)
   */
  function extractEntities() {
    const entities = {
      people: [],
      organizations: [],
      locations: [],
      products: []
    };
    
    // Extrai nomes de pessoas (padrões comuns)
    const peoplePatterns = [
      /\b[A-Z][a-z]+ [A-Z][a-z]+\b/g, // Nome Sobrenome
      /\b[A-Z][a-z]+ [A-Z][a-z]+ [A-Z][a-z]+\b/g // Nome Sobrenome Sobrenome
    ];
    
    peoplePatterns.forEach(pattern => {
      const matches = document.body.textContent.match(pattern);
      if (matches) {
        entities.people.push(...matches.slice(0, 10));
      }
    });
    
    // Extrai organizações (palavras com maiúsculas)
    const orgPattern = /\b[A-Z][a-z]+(?: [A-Z][a-z]+)*\b/g;
    const orgMatches = document.body.textContent.match(orgPattern);
    if (orgMatches) {
      entities.organizations = orgMatches
        .filter(org => org.length > 3 && org.length < 50)
        .slice(0, 10);
    }
    
    return entities;
  }
  
  /**
   * Analisa sentimento básico do conteúdo
   */
  function analyzeSentiment() {
    const text = document.body.textContent.toLowerCase();
    
    const positiveWords = [
      'excelente', 'ótimo', 'bom', 'positivo', 'sucesso', 'melhor',
      'inovador', 'revolucionário', 'incrível', 'fantástico'
    ];
    
    const negativeWords = [
      'ruim', 'péssimo', 'negativo', 'problema', 'erro', 'falha',
      'crítico', 'perigoso', 'prejudicial', 'terrível'
    ];
    
    let positiveCount = 0;
    let negativeCount = 0;
    
    positiveWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'g');
      const matches = text.match(regex);
      if (matches) positiveCount += matches.length;
    });
    
    negativeWords.forEach(word => {
      const regex = new RegExp(`\\b${word}\\b`, 'g');
      const matches = text.match(regex);
      if (matches) negativeCount += matches.length;
    });
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }
  
  /**
   * Calcula nível de leitura básico
   */
  function calculateReadingLevel() {
    const text = document.body.textContent;
    const sentences = text.split(/[.!?]+/).length;
    const words = text.split(/\s+/).length;
    const avgWordsPerSentence = words / sentences;
    
    if (avgWordsPerSentence < 10) return 'basic';
    if (avgWordsPerSentence < 20) return 'intermediate';
    return 'advanced';
  }
  
  /**
   * Analisa estrutura do conteúdo
   */
  function analyzeContentStructure() {
    const structure = {
      hasTableOfContents: false,
      hasRelatedArticles: false,
      hasComments: false,
      hasSocialSharing: false,
      estimatedReadingTime: 0
    };
    
    // Verifica se tem índice
    structure.hasTableOfContents = !!document.querySelector('.toc, .table-of-contents, [class*="toc"]');
    
    // Verifica se tem artigos relacionados
    structure.hasRelatedArticles = !!document.querySelector('.related, .related-articles, [class*="related"]');
    
    // Verifica se tem comentários
    structure.hasComments = !!document.querySelector('.comments, .comment-section, [class*="comment"]');
    
    // Verifica se tem compartilhamento social
    structure.hasSocialSharing = !!document.querySelector('.social-share, .share-buttons, [class*="share"]');
    
    // Calcula tempo estimado de leitura
    const words = document.body.textContent.split(/\s+/).length;
    structure.estimatedReadingTime = Math.ceil(words / 200); // 200 palavras por minuto
    
    return structure;
  }
  
  // Log de inicialização
  console.log('🔍 BuscaLogo: Content script pronto para coleta manual');
  
})();

