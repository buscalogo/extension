/**
 * WebRTC Manager - BuscaLogo
 * 
 * Gerencia conexões peer-to-peer usando WebRTC DataChannels
 * para troca de dados entre peers sem passar pelo servidor.
 */

class WebRTCManager {
  constructor(signalingClient) {
    this.signalingClient = signalingClient;
    this.peerConnections = new Map(); // peerId -> RTCPeerConnection
    this.dataChannels = new Map(); // peerId -> RTCDataChannel
    this.localStream = null;
    this.configuration = {
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' }
      ]
    };
    
    // Bind methods
    this.createPeerConnection = this.createPeerConnection.bind(this);
    this.handleSignalingMessage = this.handleSignalingMessage.bind(this);
    this.sendData = this.sendData.bind(this);
    this.broadcastData = this.broadcastData.bind(this);
    this.closePeerConnection = this.closePeerConnection.bind(this);
    this.closeAllConnections = this.closeAllConnections.bind(this);
    
    // Registra handlers de sinalização
    this.signalingClient.on('webrtc-signal', this.handleSignalingMessage);
    this.signalingClient.on('peer-left', (data) => {
      this.closePeerConnection(data.peerId);
    });
  }
  
  /**
   * Cria uma nova conexão peer
   */
  async createPeerConnection(peerId, isInitiator = false) {
    if (this.peerConnections.has(peerId)) {
      console.log(`⚠️ Conexão com ${peerId} já existe`);
      return this.peerConnections.get(peerId);
    }
    
    try {
      console.log(`🔗 Criando conexão WebRTC com ${peerId} (iniciador: ${isInitiator})`);
      
      const peerConnection = new RTCPeerConnection(this.configuration);
      this.peerConnections.set(peerId, peerConnection);
      
      // Configura handlers de eventos
      peerConnection.onicecandidate = (event) => {
        if (event.candidate) {
          console.log(`📤 Enviando candidato ICE para ${peerId}`);
          this.signalingClient.sendMessage('ice-candidate', {
            candidate: event.candidate
          }, peerId);
        }
      };
      
      peerConnection.onconnectionstatechange = () => {
        console.log(`🔄 Estado da conexão com ${peerId}: ${peerConnection.connectionState}`);
        
        if (peerConnection.connectionState === 'connected') {
          console.log(`✅ Conexão P2P estabelecida com ${peerId}`);
        } else if (peerConnection.connectionState === 'failed' || 
                   peerConnection.connectionState === 'disconnected') {
          console.log(`❌ Conexão P2P falhou com ${peerId}`);
          this.closePeerConnection(peerId);
        }
      };
      
      peerConnection.ondatachannel = (event) => {
        console.log(`📡 Canal de dados recebido de ${peerId}`);
        this.setupDataChannel(peerId, event.channel);
      };
      
      // Se for iniciador, cria canal de dados
      if (isInitiator) {
        const dataChannel = peerConnection.createDataChannel('buscalogo', {
          ordered: true
        });
        this.setupDataChannel(peerId, dataChannel);
        
        // Cria oferta
        const offer = await peerConnection.createOffer();
        await peerConnection.setLocalDescription(offer);
        
        console.log(`📤 Enviando oferta para ${peerId}`);
        this.signalingClient.sendMessage('offer', {
          sdp: offer
        }, peerId);
      }
      
      return peerConnection;
      
    } catch (error) {
      console.error(`❌ Erro ao criar conexão com ${peerId}:`, error);
      this.closePeerConnection(peerId);
      throw error;
    }
  }
  
  /**
   * Configura canal de dados
   */
  setupDataChannel(peerId, dataChannel) {
    this.dataChannels.set(peerId, dataChannel);
    
    dataChannel.onopen = () => {
      console.log(`📡 Canal de dados aberto com ${peerId}`);
    };
    
    dataChannel.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        this.handleDataMessage(peerId, message);
      } catch (error) {
        console.error(`❌ Erro ao processar mensagem de dados de ${peerId}:`, error);
      }
    };
    
    dataChannel.onclose = () => {
      console.log(`📡 Canal de dados fechado com ${peerId}`);
      this.dataChannels.delete(peerId);
    };
    
    dataChannel.onerror = (error) => {
      console.error(`❌ Erro no canal de dados com ${peerId}:`, error);
    };
  }
  
  /**
   * Processa mensagens de sinalização WebRTC
   */
  async handleSignalingMessage(message) {
    const { type, fromPeerId, data } = message;
    
    try {
      let peerConnection = this.peerConnections.get(fromPeerId);
      
      if (!peerConnection) {
        // Cria conexão se não existir
        peerConnection = await this.createPeerConnection(fromPeerId, false);
      }
      
      switch (type) {
        case 'offer':
          console.log(`📥 Recebida oferta de ${fromPeerId}`);
          await peerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp));
          
          // Cria resposta
          const answer = await peerConnection.createAnswer();
          await peerConnection.setLocalDescription(answer);
          
          console.log(`📤 Enviando resposta para ${fromPeerId}`);
          this.signalingClient.sendMessage('answer', {
            sdp: answer
          }, fromPeerId);
          break;
          
        case 'answer':
          console.log(`📥 Recebida resposta de ${fromPeerId}`);
          await peerConnection.setRemoteDescription(new RTCSessionDescription(data.sdp));
          break;
          
        case 'ice-candidate':
          console.log(`📥 Recebido candidato ICE de ${fromPeerId}`);
          await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
          break;
          
        default:
          console.warn(`⚠️ Tipo de sinalização desconhecido: ${type}`);
      }
      
    } catch (error) {
      console.error(`❌ Erro ao processar sinalização de ${fromPeerId}:`, error);
      this.closePeerConnection(fromPeerId);
    }
  }
  
  /**
   * Processa mensagens de dados recebidas
   */
  handleDataMessage(peerId, message) {
    const { type, data, timestamp } = message;
    
    console.log(`📥 Dados recebidos de ${peerId}: ${type}`, data);
    
    // Emite evento para o tipo de mensagem
    this.emit('data-message', { peerId, type, data, timestamp });
    
    // Processa mensagens específicas
    switch (type) {
      case 'search-query':
        // Query de busca recebida de outro peer
        this.emit('remote-search-query', { peerId, query: data.query, timestamp });
        break;
        
      case 'search-results':
        // Resultados de busca recebidos de outro peer
        this.emit('remote-search-results', { peerId, results: data.results, timestamp });
        break;
        
      case 'ping':
        // Responde ping com pong
        this.sendData(peerId, 'pong', { timestamp: Date.now() });
        break;
        
      default:
        console.log(`📥 Mensagem de dados não processada: ${type}`);
    }
  }
  
  /**
   * Envia dados para um peer específico
   */
  sendData(peerId, type, data) {
    const dataChannel = this.dataChannels.get(peerId);
    
    if (!dataChannel || dataChannel.readyState !== 'open') {
      console.warn(`⚠️ Canal de dados não disponível para ${peerId}`);
      return false;
    }
    
    try {
      const message = {
        type: type,
        data: data,
        timestamp: Date.now()
      };
      
      dataChannel.send(JSON.stringify(message));
      console.log(`📤 Dados enviados para ${peerId}: ${type}`);
      return true;
      
    } catch (error) {
      console.error(`❌ Erro ao enviar dados para ${peerId}:`, error);
      return false;
    }
  }
  
  /**
   * Envia dados para todos os peers conectados
   */
  broadcastData(type, data) {
    let sentCount = 0;
    
    for (const [peerId, dataChannel] of this.dataChannels) {
      if (dataChannel.readyState === 'open') {
        if (this.sendData(peerId, type, data)) {
          sentCount++;
        }
      }
    }
    
    console.log(`📡 Dados broadcast para ${sentCount} peers: ${type}`);
    return sentCount;
  }
  
  /**
   * Envia query de busca para todos os peers
   */
  broadcastSearchQuery(query) {
    return this.broadcastData('search-query', { query: query });
  }
  
  /**
   * Envia resultados de busca para um peer específico
   */
  sendSearchResults(peerId, results) {
    return this.sendData(peerId, 'search-results', { results: results });
  }
  
  /**
   * Fecha conexão com um peer específico
   */
  closePeerConnection(peerId) {
    const peerConnection = this.peerConnections.get(peerId);
    const dataChannel = this.dataChannels.get(peerId);
    
    if (dataChannel) {
      dataChannel.close();
      this.dataChannels.delete(peerId);
    }
    
    if (peerConnection) {
      peerConnection.close();
      this.peerConnections.delete(peerId);
    }
    
    console.log(`🔌 Conexão com ${peerId} fechada`);
  }
  
  /**
   * Fecha todas as conexões
   */
  closeAllConnections() {
    console.log('🔌 Fechando todas as conexões WebRTC...');
    
    for (const [peerId, dataChannel] of this.dataChannels) {
      dataChannel.close();
    }
    
    for (const [peerId, peerConnection] of this.peerConnections) {
      peerConnection.close();
    }
    
    this.dataChannels.clear();
    this.peerConnections.clear();
    
    console.log('✅ Todas as conexões fechadas');
  }
  
  /**
   * Obtém status das conexões
   */
  getStatus() {
    const connectedPeers = [];
    const dataChannels = [];
    
    for (const [peerId, peerConnection] of this.peerConnections) {
      if (peerConnection.connectionState === 'connected') {
        connectedPeers.push(peerId);
      }
    }
    
    for (const [peerId, dataChannel] of this.dataChannels) {
      if (dataChannel.readyState === 'open') {
        dataChannels.push(peerId);
      }
    }
    
    return {
      totalConnections: this.peerConnections.size,
      connectedPeers: connectedPeers,
      openDataChannels: dataChannels,
      totalDataChannels: this.dataChannels.size
    };
  }
  
  /**
   * Sistema de eventos simples
   */
  constructor(signalingClient) {
    // ... existing code ...
    this.eventHandlers = new Map();
  }
  
  on(type, handler) {
    if (!this.eventHandlers.has(type)) {
      this.eventHandlers.set(type, []);
    }
    this.eventHandlers.get(type).push(handler);
  }
  
  off(type, handler) {
    if (this.eventHandlers.has(type)) {
      const handlers = this.eventHandlers.get(type);
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }
  
  emit(type, data) {
    if (this.eventHandlers.has(type)) {
      this.eventHandlers.get(type).forEach(handler => {
        try {
          handler(data);
        } catch (error) {
          console.error(`❌ Erro no handler de ${type}:`, error);
        }
      });
    }
  }
}

// Exporta para uso em outros módulos
if (typeof module !== 'undefined' && module.exports) {
  module.exports = WebRTCManager;
} else if (typeof window !== 'undefined') {
  window.WebRTCManager = WebRTCManager;
}
