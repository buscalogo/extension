/**
 * Analytics Dashboard - BuscaLogo
 * 
 * Dashboard para visualizar estatísticas e métricas da extensão
 * em tempo real com gráficos interativos.
 */

class AnalyticsDashboard {
  constructor() {
    this.charts = {};
    this.data = {};
    this.isLoading = false;
    this.refreshInterval = null;
    
    this.init();
  }
  
  /**
   * Inicializa o dashboard
   */
  async init() {
    try {
      console.log('🚀 Dashboard Analytics iniciando...');
      
      // Configura event listeners
      this.setupEventListeners();
      
      // Carrega dados iniciais
      await this.loadDashboardData();
      
      // Inicia atualização automática
      this.startAutoRefresh();
      
      console.log('✅ Dashboard Analytics inicializado');
      
    } catch (error) {
      console.error('❌ Erro ao inicializar dashboard:', error);
      this.showError('Erro ao inicializar dashboard: ' + error.message);
    }
  }
  
  /**
   * Configura event listeners
   */
  setupEventListeners() {
    document.getElementById('refreshData').addEventListener('click', () => this.loadDashboardData());
    document.getElementById('exportData').addEventListener('click', () => this.exportData());
    document.getElementById('openPopup').addEventListener('click', () => this.openPopup());
  }
  
  /**
   * Carrega dados do dashboard
   */
  async loadDashboardData() {
    try {
      this.setLoading(true);
      console.log('📊 Carregando dados do dashboard...');
      
      // Obtém estatísticas básicas
      const statsResponse = await this.sendMessage('GET_STATS');
      if (statsResponse.success) {
        this.data.stats = statsResponse.stats;
      }
      
      // Obtém status detalhado
      const statusResponse = await this.sendMessage('GET_STATUS');
      if (statusResponse.success) {
        this.data.status = statusResponse.status;
      }
      
      // Obtém dados para gráficos
      const analyticsResponse = await this.sendMessage('GET_ANALYTICS_DATA');
      if (analyticsResponse.success) {
        this.data.analytics = analyticsResponse.data;
      }
      
      // Atualiza interface
      this.updateDashboard();
      
      // Atualiza indicador de atualização
      this.updateRefreshIndicator();
      
      console.log('✅ Dados do dashboard carregados');
      
    } catch (error) {
      console.error('❌ Erro ao carregar dados:', error);
      this.showError('Erro ao carregar dados: ' + error.message);
    } finally {
      this.setLoading(false);
    }
  }
  
  /**
   * Atualiza interface do dashboard
   */
  updateDashboard() {
    try {
      // Atualiza métricas principais
      this.updateMainMetrics();
      
      // Atualiza gráficos
      this.updateCharts();
      
      // Atualiza estatísticas detalhadas
      this.updateDetailedStats();
      
      // Atualiza estatísticas de crawling
      this.updateCrawlingStats();
      
    } catch (error) {
      console.error('❌ Erro ao atualizar dashboard:', error);
    }
  }
  
  /**
   * Atualiza métricas principais
   */
  updateMainMetrics() {
    const { stats, status } = this.data;
    
    if (stats) {
      document.getElementById('totalPages').textContent = stats.totalPages || 0;
      document.getElementById('uniqueHosts').textContent = stats.uniqueHosts || 0;
    }
    
    if (status) {
      // Calcula páginas hoje
      const today = new Date().toDateString();
      const pagesToday = status.crawlingStats?.totalCaptured || 0;
      document.getElementById('pagesToday').textContent = pagesToday;
      
      // Calcula qualidade média (simulado por enquanto)
      const avgQuality = this.calculateAverageQuality();
      document.getElementById('avgQuality').textContent = avgQuality.toFixed(1);
    }
  }
  
  /**
   * Calcula qualidade média das páginas
   */
  calculateAverageQuality() {
    // Simulação - em produção seria baseado em scores reais
    const baseQuality = 0.7;
    const randomVariation = (Math.random() - 0.5) * 0.3;
    return Math.max(0.1, Math.min(1.0, baseQuality + randomVariation));
  }
  
  /**
   * Atualiza gráficos
   */
  updateCharts() {
    try {
      // Gráfico de páginas por dia
      this.updatePagesChart();
      
      // Gráfico de domínios
      this.updateDomainsChart();
      
    } catch (error) {
      console.error('❌ Erro ao atualizar gráficos:', error);
    }
  }
  
  /**
   * Atualiza gráfico de páginas por dia
   */
  updatePagesChart() {
    const ctx = document.getElementById('pagesChart');
    if (!ctx) return;
    
    // Destroi gráfico existente
    if (this.charts.pages) {
      this.charts.pages.destroy();
    }
    
    // Gera dados para os últimos 7 dias
    const data = this.generatePagesPerDayData();
    
    this.charts.pages = new Chart(ctx, {
      type: 'line',
      data: {
        labels: data.labels,
        datasets: [{
          label: 'Páginas Capturadas',
          data: data.values,
          borderColor: '#4CAF50',
          backgroundColor: 'rgba(76, 175, 80, 0.1)',
          borderWidth: 2,
          fill: true,
          tension: 0.4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            labels: {
              color: 'white'
            }
          }
        },
        scales: {
          x: {
            ticks: {
              color: 'white'
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          },
          y: {
            ticks: {
              color: 'white'
            },
            grid: {
              color: 'rgba(255, 255, 255, 0.1)'
            }
          }
        }
      }
    });
  }
  
  /**
   * Atualiza gráfico de domínios
   */
  updateDomainsChart() {
    const ctx = document.getElementById('domainsChart');
    if (!ctx) return;
    
    // Destroi gráfico existente
    if (this.charts.domains) {
      this.charts.domains.destroy();
    }
    
    // Gera dados de domínios
    const data = this.generateDomainsData();
    
    this.charts.domains = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: data.labels,
        datasets: [{
          data: data.values,
          backgroundColor: [
            '#FF6384',
            '#36A2EB',
            '#FFCE56',
            '#4BC0C0',
            '#9966FF',
            '#FF9F40',
            '#FF6384',
            '#C9CBCF',
            '#4BC0C0',
            '#FF6384'
          ],
          borderWidth: 2,
          borderColor: 'rgba(255, 255, 255, 0.1)'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              color: 'white',
              font: {
                size: 12
              }
            }
          }
        }
      }
    });
  }
  
  /**
   * Gera dados para gráfico de páginas por dia
   */
  generatePagesPerDayData() {
    const labels = [];
    const values = [];
    
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      
      const dayName = date.toLocaleDateString('pt-BR', { weekday: 'short' });
      labels.push(dayName);
      
      // Simula dados - em produção viria do IndexedDB
      const randomPages = Math.floor(Math.random() * 20) + 5;
      values.push(randomPages);
    }
    
    return { labels, values };
  }
  
  /**
   * Gera dados para gráfico de domínios
   */
  generateDomainsData() {
    const domains = [
      'linux.com',
      'ubuntu.com',
      'debian.org',
      'fedora.org',
      'archlinux.org',
      'gentoo.org',
      'opensuse.org',
      'centos.org',
      'redhat.com',
      'suse.com'
    ];
    
    const labels = domains.slice(0, 10);
    const values = labels.map(() => Math.floor(Math.random() * 100) + 10);
    
    return { labels, values };
  }
  
  /**
   * Atualiza estatísticas detalhadas
   */
  updateDetailedStats() {
    const { analytics } = this.data;
    
    if (analytics) {
      document.getElementById('totalLinks').textContent = analytics.totalLinks || 0;
      document.getElementById('totalAnalyses').textContent = analytics.totalAnalyses || 0;
      document.getElementById('dbSize').textContent = this.formatBytes(analytics.dbSize || 0);
      document.getElementById('lastUpdate').textContent = this.formatDate(analytics.lastUpdate || Date.now());
    }
  }
  
  /**
   * Atualiza estatísticas de crawling
   */
  updateCrawlingStats() {
    const { status } = this.data;
    
    if (status && status.crawlingStats) {
      const stats = status.crawlingStats;
      
      document.getElementById('totalDiscovered').textContent = stats.totalDiscovered || 0;
      document.getElementById('totalCaptured').textContent = stats.totalCaptured || 0;
      document.getElementById('totalFailed').textContent = stats.totalFailed || 0;
      document.getElementById('crawlingStatus').textContent = stats.isActive ? 'Ativo' : 'Inativo';
      document.getElementById('queueSize').textContent = stats.queueSize || 0;
    }
  }
  
  /**
   * Atualiza indicador de atualização
   */
  updateRefreshIndicator() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('pt-BR');
    document.getElementById('refreshIndicator').textContent = `Última atualização: ${timeString}`;
  }
  
  /**
   * Inicia atualização automática
   */
  startAutoRefresh() {
    // Atualiza a cada 30 segundos
    this.refreshInterval = setInterval(() => {
      this.loadDashboardData();
    }, 30000);
    
    console.log('🔄 Atualização automática iniciada (30s)');
  }
  
  /**
   * Para atualização automática
   */
  stopAutoRefresh() {
    if (this.refreshInterval) {
      clearInterval(this.refreshInterval);
      this.refreshInterval = null;
      console.log('🔄 Atualização automática parada');
    }
  }
  
  /**
   * Exporta dados do dashboard
   */
  async exportData() {
    try {
      this.setLoading(true);
      document.getElementById('exportData').textContent = '📤 Exportando...';
      
      const response = await this.sendMessage('EXPORT_ANALYTICS_DATA');
      
      if (response.success) {
        const data = response.data;
        const blob = new Blob([JSON.stringify(data, null, 2)], {
          type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `buscalogo-analytics-${Date.now()}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        this.showSuccess('Dados exportados com sucesso!');
      } else {
        throw new Error(response.error || 'Erro ao exportar dados');
      }
      
    } catch (error) {
      console.error('❌ Erro ao exportar dados:', error);
      this.showError('Erro ao exportar dados: ' + error.message);
    } finally {
      this.setLoading(false);
      document.getElementById('exportData').textContent = '📤 Exportar Dados';
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
   * Define estado de loading
   */
  setLoading(loading) {
    this.isLoading = loading;
    
    const buttons = document.querySelectorAll('.btn');
    buttons.forEach(btn => {
      btn.disabled = loading;
    });
    
    if (loading) {
      document.body.classList.add('loading');
    } else {
      document.body.classList.remove('loading');
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
  
  /**
   * Formata bytes para exibição
   */
  formatBytes(bytes) {
    if (bytes === 0) return '0 B';
    
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
  
  /**
   * Formata data para exibição
   */
  formatDate(timestamp) {
    const date = new Date(timestamp);
    return date.toLocaleString('pt-BR');
  }
  
  /**
   * Cleanup ao destruir
   */
  destroy() {
    this.stopAutoRefresh();
    
    // Destroi gráficos
    Object.values(this.charts).forEach(chart => {
      if (chart && typeof chart.destroy === 'function') {
        chart.destroy();
      }
    });
    
    this.charts = {};
  }
}

// Inicializa o dashboard quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
  window.analyticsDashboard = new AnalyticsDashboard();
});

// Cleanup ao fechar a página
window.addEventListener('beforeunload', () => {
  if (window.analyticsDashboard) {
    window.analyticsDashboard.destroy();
  }
});
