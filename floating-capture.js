/**
 * Botão Flutuante de Captura - BuscaLogo
 * 
 * Script otimizado para evitar travamentos do navegador
 * Implementa lazy loading e debouncing para melhor performance
 */

class BuscaLogoFloatingCapture {
  constructor() {
    this.isInitialized = false;
    this.isVisible = false;
    this.currentUrl = '';
    this.autoHideTimer = null;
    this.debounceTimer = null;
    this.settings = {
      enabled: true,
      autoHide: true,
      showTitle: true,
      hideDelay: 5000
    };
    
    // Bind methods para evitar problemas de contexto
    this.handleClick = this.handleClick.bind(this);
    this.handleMouseEnter = this.handleMouseEnter.bind(this);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
    
    // Inicialização lazy
    this.initLazy();
  }
  
  /**
   * Inicialização lazy para evitar sobrecarga
   */
  initLazy() {
    // Aguarda o DOM estar pronto
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      // DOM já está pronto, inicializa com delay
      setTimeout(() => this.init(), 100);
    }
  }
  
  /**
   * Inicializa o botão flutuante
   */
  async init() {
    if (this.isInitialized) return;
    
    try {
      console.log('🎯 Inicializando botão flutuante de captura...');
      console.log('🎯 DOM ready state:', document.readyState);
      console.log('🎯 URL atual:', window.location.href);
      
      // Carrega configurações
      await this.loadSettings();
      console.log('🎯 Configurações carregadas:', this.settings);
      
      // Cria o botão
      this.createButton();
      console.log('🎯 Botão criado');
      
      // Configura observador de mudanças de URL
      this.setupUrlObserver();
      console.log('🎯 Observador configurado');
      
      // Verifica página atual
      this.checkCurrentPage();
      console.log('🎯 Página verificada');
      
      this.isInitialized = true;
      console.log('✅ Botão flutuante inicializado com sucesso');
      
    } catch (error) {
      console.error('❌ Erro ao inicializar botão flutuante:', error);
    }
  }
  
  /**
   * Carrega configurações do storage
   */
  async loadSettings() {
    try {
      const result = await chrome.storage.local.get(['floatingCaptureSettings']);
      if (result.floatingCaptureSettings) {
        this.settings = { ...this.settings, ...result.floatingCaptureSettings };
      }
    } catch (error) {
      console.warn('⚠️ Erro ao carregar configurações, usando padrões');
    }
  }
  
  /**
   * Cria o botão flutuante
   */
  createButton() {
    try {
      console.log('🎯 Criando botão flutuante...');
      
      // Remove botão existente se houver
      const existingButton = document.querySelector('.buscalogo-floating-capture');
      if (existingButton) {
        console.log('🎯 Removendo botão existente');
        existingButton.remove();
      }
      
      // Verifica se o body existe
      if (!document.body) {
        console.error('❌ Body não encontrado, aguardando...');
        setTimeout(() => this.createButton(), 100);
        return;
      }
      
      // Cria container
      const container = document.createElement('div');
      container.className = 'buscalogo-floating-capture hidden';
      container.id = 'buscalogo-floating-capture';
      
      // Cria botão
      const button = document.createElement('button');
      button.className = 'buscalogo-capture-button';
      button.innerHTML = `
        <span class="buscalogo-capture-icon">🔍</span>
        <span class="buscalogo-capture-text">Capturar</span>
        <div class="buscalogo-capture-tooltip">Clique para capturar esta página</div>
      `;
      
      // Adiciona event listeners
      button.addEventListener('click', this.handleClick);
      button.addEventListener('mouseenter', this.handleMouseEnter);
      button.addEventListener('mouseleave', this.handleMouseLeave);
      
      // Adiciona ao DOM
      container.appendChild(button);
      document.body.appendChild(container);
      
      // Referência para manipulação
      this.container = container;
      this.button = button;
      
      console.log('🎯 Botão criado e adicionado ao DOM');
      console.log('🎯 Container:', this.container);
      console.log('🎯 Button:', this.button);
      
    } catch (error) {
      console.error('❌ Erro ao criar botão:', error);
    }
  }
  
  /**
   * Configura observador de mudanças de URL
   */
  setupUrlObserver() {
    // Debounced para evitar múltiplas execuções
    const debouncedCheck = () => {
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
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
  }
  
  /**
   * Verifica a página atual
   */
  async checkCurrentPage() {
    if (!this.isInitialized || !this.settings.enabled) return;
    
    try {
      const url = window.location.href;
      
      // Evita verificar a mesma URL
      if (url === this.currentUrl) return;
      this.currentUrl = url;
      
      // Verifica se é uma página válida
      if (!this.isValidPage(url)) {
        this.hide();
        return;
      }
      
      // Verifica se já foi capturada (com debouncing)
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(async () => {
        await this.checkPageStatus(url);
      }, 500);
      
    } catch (error) {
      console.warn('⚠️ Erro ao verificar página:', error);
    }
  }
  
  /**
   * Verifica se a página é válida para captura
   */
  isValidPage(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.protocol === 'http:' || urlObj.protocol === 'https:';
    } catch {
      return false;
    }
  }
  
  /**
   * Verifica status da página
   */
  async checkPageStatus(url) {
    try {
      // Envia mensagem para verificar se já foi capturada
      const response = await this.sendMessage('CHECK_PAGE_CAPTURED', { url });
      
      if (response && response.success) {
        if (response.isCaptured) {
          // Verifica se deve mostrar notificação de página já capturada
          if (response.showAlreadyCaptured === true) {
            this.showAlreadyCaptured();
          } else {
            console.log('🎯 BuscaLogo: Configuração desabilita notificação de já capturada - não mostrando nada');
          }
        } else {
          // Verifica se deve mostrar notificação de página não capturada
          if (response.showNotCaptured === true) {
            this.show();
          } else {
            console.log('🎯 BuscaLogo: Configuração desabilita notificação de não capturada - não mostrando nada');
          }
        }
      } else {
        // Se não conseguir verificar, mostra por padrão
        this.show();
      }
      
    } catch (error) {
      console.warn('⚠️ Erro ao verificar status da página:', error);
      // Em caso de erro, mostra o botão
      this.show();
    }
  }
  
  /**
   * Mostra o botão
   */
  show() {
    if (!this.container || this.isVisible) return;
    
    this.isVisible = true;
    this.container.classList.remove('hidden');
    this.container.classList.add('entering');
    
    // Remove classe de entrada após animação
    setTimeout(() => {
      this.container.classList.remove('entering');
    }, 500);
    
    // Auto-hide se configurado
    if (this.settings.autoHide) {
      this.startAutoHide();
    }
    
    console.log('🎯 Botão flutuante exibido');
  }
  
  /**
   * Esconde o botão
   */
  hide() {
    if (!this.container || !this.isVisible) return;
    
    this.isVisible = false;
    this.container.classList.add('hidden');
    this.stopAutoHide();
    
    console.log('🎯 Botão flutuante ocultado');
  }
  
  /**
   * Mostra botão como já capturado
   */
  showAlreadyCaptured() {
    if (!this.container || this.isVisible) return;
    
    this.isVisible = true;
    this.container.classList.remove('hidden');
    this.container.classList.add('entering');
    this.button.classList.add('already-captured');
    this.button.innerHTML = `
      <span class="buscalogo-capture-icon">✅</span>
      <span class="buscalogo-capture-text">Já Capturada</span>
      <div class="buscalogo-capture-tooltip">Esta página já foi capturada</div>
    `;
    
    // Remove classe de entrada após animação
    setTimeout(() => {
      this.container.classList.remove('entering');
    }, 500);
    
    console.log('🎯 Botão flutuante exibido (já capturado)');
  }
  
  /**
   * Inicia timer de auto-hide
   */
  startAutoHide() {
    this.stopAutoHide();
    
    this.autoHideTimer = setTimeout(() => {
      if (this.isVisible && this.settings.autoHide) {
        this.container.classList.add('auto-hide');
        setTimeout(() => {
          this.hide();
        }, 5000);
      }
    }, this.settings.hideDelay);
  }
  
  /**
   * Para timer de auto-hide
   */
  stopAutoHide() {
    if (this.autoHideTimer) {
      clearTimeout(this.autoHideTimer);
      this.autoHideTimer = null;
    }
  }
  
  /**
   * Handler de clique no botão
   */
  async handleClick(event) {
    event.preventDefault();
    event.stopPropagation();
    
    if (this.button.classList.contains('already-captured')) {
      return;
    }
    
    try {
      // Mostra estado de capturando
      this.button.classList.add('capturing');
      this.button.innerHTML = `
        <span class="buscalogo-capture-icon">⏳</span>
        <span class="buscalogo-capture-text">Capturando...</span>
      `;
      
      // Envia comando de captura
      const response = await this.sendMessage('CAPTURE_CURRENT_PAGE', {
        url: window.location.href,
        title: document.title
      });
      
      if (response && response.success) {
        // Sucesso - mostra como já capturado
        this.button.classList.remove('capturing');
        this.showAlreadyCaptured();
        
        // Notifica sucesso
        this.showNotification('✅ Página capturada com sucesso!');
        
      } else {
        throw new Error(response?.error || 'Erro desconhecido');
      }
      
    } catch (error) {
      console.error('❌ Erro ao capturar página:', error);
      
      // Restaura botão
      this.button.classList.remove('capturing');
      this.button.innerHTML = `
        <span class="buscalogo-capture-icon">🔍</span>
        <span class="buscalogo-capture-text">Capturar</span>
        <div class="buscalogo-capture-tooltip">Clique para capturar esta página</div>
      `;
      
      // Notifica erro
      this.showNotification('❌ Erro ao capturar página: ' + error.message);
    }
  }
  
  /**
   * Handler de mouse enter
   */
  handleMouseEnter() {
    this.stopAutoHide();
  }
  
  /**
   * Handler de mouse leave
   */
  handleMouseLeave() {
    if (this.settings.autoHide) {
      this.startAutoHide();
    }
  }
  
  /**
   * Envia mensagem para o background script
   */
  async sendMessage(type, data = {}) {
    try {
      return new Promise((resolve, reject) => {
        if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.sendMessage) {
          chrome.runtime.sendMessage({ type, data }, (response) => {
            if (chrome.runtime.lastError) {
              reject(new Error(chrome.runtime.lastError.message));
            } else {
              resolve(response);
            }
          });
        } else {
          reject(new Error('Chrome runtime não disponível'));
        }
      });
    } catch (error) {
      throw new Error('Erro ao enviar mensagem: ' + error.message);
    }
  }
  
  /**
   * Mostra notificação simples
   */
  showNotification(message) {
    try {
      // Cria notificação temporária
      const notification = document.createElement('div');
      notification.style.cssText = `
        position: fixed;
        top: 80px;
        right: 20px;
        background: rgba(0, 0, 0, 0.8);
        color: white;
        padding: 12px 16px;
        border-radius: 6px;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        font-size: 14px;
        z-index: 999998;
        animation: buscalogo-notification 3s ease-in-out forwards;
      `;
      notification.textContent = message;
      
      // Adiciona CSS da animação
      if (!document.querySelector('#buscalogo-notification-styles')) {
        const style = document.createElement('style');
        style.id = 'buscalogo-notification-styles';
        style.textContent = `
          @keyframes buscalogo-notification {
            0%, 20% { opacity: 0; transform: translateX(100px); }
            80% { opacity: 1; transform: translateX(0); }
            100% { opacity: 0; transform: translateX(100px); }
          }
        `;
        document.head.appendChild(style);
      }
      
      document.body.appendChild(notification);
      
      // Remove após 3 segundos
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 3000);
      
    } catch (error) {
      console.warn('⚠️ Erro ao mostrar notificação:', error);
    }
  }
  
  /**
   * Atualiza configurações
   */
  updateSettings(newSettings) {
    this.settings = { ...this.settings, ...newSettings };
    
    // Aplica mudanças imediatamente
    if (!this.settings.enabled) {
      this.hide();
    } else {
      this.checkCurrentPage();
    }
  }
  
  /**
   * Destroi o botão flutuante
   */
  destroy() {
    try {
      this.stopAutoHide();
      clearTimeout(this.debounceTimer);
      
      if (this.container && this.container.parentNode) {
        this.container.remove();
      }
      
      this.isInitialized = false;
      this.isVisible = false;
      
      console.log('🎯 Botão flutuante destruído');
      
    } catch (error) {
      console.error('❌ Erro ao destruir botão flutuante:', error);
    }
  }
}

// Inicializa quando o script é carregado
let floatingCapture = null;

// Função global para inicialização
window.initBuscaLogoFloatingCapture = () => {
  console.log('🎯 BuscaLogo: Função global chamada');
  if (!floatingCapture) {
    console.log('🎯 BuscaLogo: Criando nova instância');
    floatingCapture = new BuscaLogoFloatingCapture();
  } else {
    console.log('🎯 BuscaLogo: Usando instância existente');
  }
  return floatingCapture;
};

// Garante que a função global está disponível
console.log('🎯 BuscaLogo: Script carregado, função global definida:', !!window.initBuscaLogoFloatingCapture);

// Auto-inicialização com delay para evitar sobrecarga
setTimeout(() => {
  console.log('🎯 BuscaLogo: Tentando auto-inicialização...');
  if (document.readyState === 'complete') {
    console.log('🎯 BuscaLogo: DOM completo, inicializando...');
    window.initBuscaLogoFloatingCapture();
  } else {
    console.log('🎯 BuscaLogo: Aguardando DOM completo...');
    window.addEventListener('load', () => {
      console.log('🎯 BuscaLogo: DOM carregado, inicializando...');
      window.initBuscaLogoFloatingCapture();
    });
  }
}, 1000);

// Também tenta inicializar quando o script é carregado
if (document.readyState === 'complete') {
  setTimeout(() => {
    console.log('🎯 BuscaLogo: Tentando inicialização imediata...');
    if (window.initBuscaLogoFloatingCapture) {
      window.initBuscaLogoFloatingCapture();
    }
  }, 100);
}

// Exporta para uso externo
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BuscaLogoFloatingCapture;
}
