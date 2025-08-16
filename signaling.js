/**
 * Signaling Client - BuscaLogo
 * 
 * Gerencia a conexão WebSocket com o servidor de sinalização
 * para estabelecer conexões P2P com outros peers.
 */

class SignalingClient {
  // constructor(serverUrl = 'ws://localhost:3001') {
  constructor(serverUrl = 'wss://api.buscalogo.com') {
    this.serverUrl = serverUrl;
    this.ws = null;
    this.peerId = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 1000;
    this.heartbeatInterval = null;
    this.messageHandlers = new Map();
    
    // Bind methods
    this.connect = this.connect.bind(this);
    this.disconnect = this.disconnect.bind(this);
    this.reconnect = this.reconnect.bind(this);
    this.sendMessage = this.sendMessage.bind(this);
    this.handleMessage = this.handleMessage.bind(this);
  }
  
  /**
   * Conecta ao servidor de sinalização
   */
  async connect(peerId = null) {
    if (this.isConnected) return;
    
    try {
      this.peerId = peerId || this.generatePeerId();
      const url = `${this.serverUrl}?peerId=${this.peerId}`;
      
      console.log(`🔗 Conectando ao servidor de sinalização: ${url}`);
      
      this.ws = new WebSocket(url);
      
      this.ws.onopen = () => {
        console.log('✅ Conectado ao servidor de sinalização');
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.startHeartbeat();
        this.emit('connected', { peerId: this.peerId });
      };
      
      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleMessage(message);
        } catch (error) {
          console.error('❌ Erro ao processar mensagem:', error);
        }
      };
      
      this.ws.onclose = (event) => {
        console.log('🔌 Desconectado do servidor de sinalização:', event.code, event.reason);
        this.isConnected = false;
        this.stopHeartbeat();
        this.emit('disconnected', { code: event.code, reason: event.reason });
        
        // Tenta reconectar se não foi fechamento intencional
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.reconnect();
        }
      };
      
      this.ws.onerror = (error) => {
        console.error('❌ Erro na conexão WebSocket:', error);
        this.emit('error', error);
      };
      
    } catch (error) {
      console.error('❌ Erro ao conectar:', error);
      this.emit('error', error);
    }
  }
  
  /**
   * Desconecta do servidor
   */
  disconnect() {
    if (this.ws) {
      this.stopHeartbeat();
      this.ws.close(1000, 'Desconexão intencional');
      this.ws = null;
    }
    this.isConnected = false;
  }
  
  /**
   * Tenta reconectar ao servidor
   */
  reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log('❌ Máximo de tentativas de reconexão atingido');
      this.emit('reconnect-failed');
      return;
    }
    
    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
    
    console.log(`🔄 Tentativa de reconexão ${this.reconnectAttempts} em ${delay}ms`);
    
    setTimeout(() => {
      this.connect(this.peerId);
    }, delay);
  }
  
  /**
   * Envia mensagem para o servidor
   */
  sendMessage(type, data = {}, targetPeerId = null) {
    if (!this.isConnected || !this.ws) {
      console.warn('⚠️ Não conectado ao servidor');
      return false;
    }
    
    try {
      const message = {
        type: type,
        data: data,
        targetPeerId: targetPeerId,
        timestamp: Date.now()
      };
      
      this.ws.send(JSON.stringify(message));
      console.log(`📤 Mensagem enviada: ${type}`, message);
      return true;
      
    } catch (error) {
      console.error('❌ Erro ao enviar mensagem:', error);
      return false;
    }
  }
  
  /**
   * Processa mensagens recebidas do servidor
   */
  handleMessage(message) {
    const { type, fromPeerId, data, timestamp } = message;
    
    console.log(`📥 Mensagem recebida: ${type} de ${fromPeerId}`, message);
    
    // Emite evento para o tipo de mensagem
    this.emit(type, { fromPeerId, data, timestamp });
    
    // Processa mensagens específicas
    switch (type) {
      case 'connected':
        this.peerId = data.peerId;
        this.emit('peer-id-assigned', { peerId: this.peerId });
        break;
        
      case 'peers':
        this.emit('peers-list', { peers: data.peers, count: data.count });
        break;
        
      case 'peer-joined':
        this.emit('peer-joined', { peerId: fromPeerId, timestamp });
        break;
        
      case 'peer-left':
        this.emit('peer-left', { peerId: fromPeerId, timestamp });
        break;
        
      case 'offer':
      case 'answer':
      case 'ice-candidate':
        // Repassa para o módulo WebRTC
        this.emit('webrtc-signal', { type, fromPeerId, data, timestamp });
        break;
        
      case 'query':
        // Repassa query para processamento local
        this.emit('search-query', { fromPeerId, data, timestamp });
        break;
        
      case 'error':
        console.error('❌ Erro do servidor:', data.message);
        this.emit('server-error', { message: data.message, timestamp });
        break;
        
      case 'pong':
        // Resposta do heartbeat
        break;
        
      default:
        console.warn(`⚠️ Tipo de mensagem desconhecido: ${type}`);
    }
  }
  
  /**
   * Inicia heartbeat para manter conexão ativa
   */
  startHeartbeat() {
    this.heartbeatInterval = setInterval(() => {
      if (this.isConnected) {
        this.sendMessage('ping');
      }
    }, 30000); // 30 segundos
  }
  
  /**
   * Para o heartbeat
   */
  stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }
  
  /**
   * Gera ID único para o peer
   */
  generatePeerId() {
    return 'peer_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }
  
  /**
   * Registra handler para um tipo de mensagem
   */
  on(type, handler) {
    if (!this.messageHandlers.has(type)) {
      this.messageHandlers.set(type, []);
    }
    this.messageHandlers.get(type).push(handler);
  }
  
  /**
   * Remove handler para um tipo de mensagem
   */
  off(type, handler) {
    if (this.messageHandlers.has(type)) {
      const handlers = this.messageHandlers.get(type);
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }
  
  /**
   * Emite evento para todos os handlers registrados
   */
  emit(type, data) {
    if (this.messageHandlers.has(type)) {
      this.messageHandlers.get(type).forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`❌ Erro no handler de ${type}:`, error);
        }
      });
    }
  }
  
  /**
   * Obtém status da conexão
   */
  getStatus() {
    return {
      isConnected: this.isConnected,
      peerId: this.peerId,
      serverUrl: this.serverUrl,
      reconnectAttempts: this.reconnectAttempts
    };
  }
}

// Exporta para uso em outros módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = SignalingClient;
} else if (typeof window !== 'undefined') {
  window.SignalingClient = SignalingClient;
}
