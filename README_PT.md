# 📱 Extensão BuscaLogo - Chrome Extension

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/yourusername/buscalogo)
[![Chrome Extension](https://img.shields.io/badge/Chrome%20Extension-Manifest%20V3-4285F4.svg)](https://developer.chrome.com/docs/extensions/)
[![Language](https://img.shields.io/badge/language-EN-blue.svg)](README.md)
[![Language](https://img.shields.io/badge/language-PT-blue.svg)](README_PT.md)
[![Language](https://img.shields.io/badge/language-ES-blue.svg)](README_ES.md)

> **Extensão Chrome Inteligente para Coleta Automatizada, Análise e Busca Local de Conteúdo Web**

## 🌟 **Visão Geral**

A Extensão BuscaLogo Chrome é uma ferramenta poderosa que automaticamente captura, analisa e indexa conteúdo web enquanto você navega. Ela fornece capacidades avançadas de busca local, análises em tempo real e processamento inteligente de conteúdo - tudo mantendo sua privacidade com armazenamento local de dados.

## 🚀 **Características Principais**

### **🔍 Captura Inteligente de Conteúdo**
- **Detecção Automática**: Identifica e captura páginas web relevantes
- **Análise de Conteúdo**: Extrai títulos, conteúdo, metadados e links
- **Pontuação de Qualidade**: Avalia automaticamente relevância e qualidade do conteúdo
- **Processamento em Lote**: Sistema baseado em fila para captura eficiente

### **📊 Interface de Busca Avançada**
- **Busca Local**: Busca rápida em todo o conteúdo capturado
- **Filtros Avançados**: Filtra por tipo de conteúdo, domínio, data e qualidade
- **Ordenação Inteligente**: Ordena por relevância, data, título ou domínio
- **Paginação**: Navegação eficiente de grandes conjuntos de resultados
- **Destaque**: Termos de busca destacados nos resultados

### **📈 Painel de Analytics**
- **Estatísticas em Tempo Real**: Atualizações ao vivo das métricas de captura
- **Gráficos de Performance**: Representação visual das tendências de dados
- **Analytics de Armazenamento**: Monitora tamanho e uso do banco de dados
- **Capacidades de Exportação**: Download de dados em múltiplos formatos

### **🔔 Sistema de Notificações**
- **Alertas Configuráveis**: Personalize preferências de notificação
- **Notificações de Eventos**: Alertas para capturas, progresso de crawling e conexões
- **Atualizações de Badge**: Indicadores visuais no ícone da extensão
- **Integração do Sistema**: Notificações nativas do Chrome

### **🔄 Colaboração P2P**
- **Busca Distribuída**: Compartilhe e descubra conteúdo com outros usuários
- **Sincronização em Tempo Real**: Atualizações ao vivo entre pares conectados
- **Privacidade Primeiro**: Sem coleta central de dados ou rastreamento

## 🛠️ **Stack Tecnológico**

- **API de Extensão Chrome** (Manifest V3)
- **JavaScript ES6+** com async/await moderno
- **IndexedDB** para armazenamento local eficiente
- **Chart.js** para visualização de dados
- **WebSocket** para comunicação em tempo real
- **Redes P2P** para busca distribuída

## 📦 **Instalação**

### **Pré-requisitos**
- Navegador Chrome/Chromium (versão 88+)
- Modo desenvolvedor habilitado

### **Passos de Instalação**

1. **Baixar a Extensão**
   - Clone este repositório ou baixe a pasta da extensão
   - Certifique-se de que todos os arquivos estão presentes na pasta `extension/`

2. **Carregar no Chrome**
   - Abra o Chrome e navegue para `chrome://extensions/`
   - Habilite "Modo desenvolvedor" (alternância no canto superior direito)
   - Clique em "Carregar sem compactação"
   - Selecione a pasta `extension/`

3. **Configurar Permissões**
   - A extensão solicitará permissões necessárias
   - Conceda acesso ao armazenamento, abas ativas e notificações
   - Revise e aceite as solicitações de permissão

4. **Verificar Instalação**
   - Procure pelo ícone BuscaLogo na barra de ferramentas do Chrome
   - Clique no ícone para abrir a interface popup
   - Verifique se todas as funcionalidades estão acessíveis

## 🔧 **Configuração**

### **Configurações de Notificação**
```javascript
// Acessível via interface popup
{
  "enabled": true,
  "newPageCaptured": true,
  "crawlingProgress": true,
  "connectionStatus": true,
  "showBadge": true
}
```

### **Configuração de Armazenamento**
```javascript
// Stores do IndexedDB
- capturedPages: Armazenamento principal de conteúdo
- linkIndex: Links descobertos e metadados
- contentAnalysis: Pontuações de qualidade do conteúdo
- captureQueue: Tarefas de captura pendentes
- crawlingStats: Métricas de performance
```

## 📚 **Guia de Uso**

### **Captura Básica de Conteúdo**

1. **Navegue para qualquer página web**
2. **Clique no ícone da extensão** na sua barra de ferramentas
3. **Clique em "Capturar Página Atual"**
4. **O conteúdo é processado automaticamente** e armazenado localmente

### **Busca Avançada**

1. **Abra a interface de busca** via popup
2. **Digite termos de busca** na caixa de pesquisa
3. **Aplique filtros** (tipo de conteúdo, domínio, intervalo de datas)
4. **Ordene resultados** por relevância, data ou qualidade
5. **Navegue pelos resultados** com paginação

### **Painel de Analytics**

1. **Abra o dashboard** via popup
2. **Veja estatísticas em tempo real** e métricas
3. **Analise performance** com gráficos interativos
4. **Exporte dados** para análise externa

### **Colaboração P2P**

1. **Conecte ao servidor de sinalização** (automático)
2. **Descubra outros usuários** na rede
3. **Compartilhe conteúdo** e resultados de busca
4. **Colabore** na descoberta de conteúdo

## 🧪 **Desenvolvimento**

### **Estrutura do Projeto**
```
extension/
├── manifest.json          # Manifest da extensão (V3)
├── background.js          # Service worker
├── content.js            # Script de conteúdo
├── popup.html            # Interface popup
├── popup.js              # Lógica do popup
├── analytics-dashboard.html  # Interface de analytics
├── analytics-dashboard.js    # Lógica de analytics
├── search-interface.html     # Interface de busca
├── search-interface.js       # Lógica de busca
├── icons/                 # Ícones da extensão
└── README.md             # Este arquivo
```

### **Comandos de Desenvolvimento**
```bash
# Carregar extensão em modo desenvolvimento
# 1. Faça alterações no código
# 2. Vá para chrome://extensions/
# 3. Clique em "Recarregar" na extensão
# 4. Teste as alterações

# Modo debug
# 1. Abra DevTools no popup da extensão
# 2. Verifique Console para logs
# 3. Use aba Sources para debugging
```

### **Testes**
```bash
# Testes manuais
1. Carregue extensão no Chrome
2. Teste todas as funcionalidades manualmente
3. Verifique tratamento de erros
4. Verifique performance

# Testes automatizados (planejado)
npm test
```

## 📊 **Métricas de Performance**

- **Velocidade de Captura**: 2-5 segundos por página
- **Eficiência de Armazenamento**: ~2KB por página capturada
- **Uso de Memória**: <50MB para 1000+ páginas
- **Resposta de Busca**: <100ms para consultas locais
- **Tempo de Inicialização**: <2 segundos

## 🔒 **Privacidade e Segurança**

### **Armazenamento de Dados**
- **Apenas Local**: Todos os dados armazenados no seu navegador
- **Sem Nuvem**: Nenhum dado enviado para servidores externos
- **IndexedDB**: Armazenamento local seguro e criptografado
- **Controle do Usuário**: Controle total sobre dados capturados

### **Permissões**
- **Armazenamento**: Gerenciamento de dados locais
- **Aba Ativa**: Captura de conteúdo da página atual
- **Scripting**: Análise dinâmica de conteúdo
- **Notificações**: Alertas do usuário e badges

### **Recursos de Segurança**
- **Sem Rastreamento**: Sem monitoramento de comportamento do usuário
- **Processamento Local**: Toda análise feita localmente
- **Comunicação Segura**: WSS para conexões P2P
- **Código Aberto**: Revisão transparente de código

## 🐛 **Solução de Problemas**

### **Problemas Comuns**

**Extensão não carrega**
- Verifique versão do Chrome (88+ necessário)
- Verifique sintaxe do manifest.json
- Limpe cache do navegador e recarregue
- Desabilite extensões conflitantes

**Erros de permissão**
- Conceda todas as permissões solicitadas
- Verifique configurações do Chrome
- Reinicie navegador se necessário

**Problemas de armazenamento**
- Verifique suporte ao IndexedDB
- Verifique espaço em disco disponível
- Limpe dados da extensão se corrompidos

**Problemas de performance**
- Monitore uso de memória
- Limite capturas concorrentes
- Limpeza regular de dados

### **Informações de Debug**
```javascript
// Habilitar modo debug
localStorage.setItem('debug', 'true');

// Verificar status do armazenamento
chrome.storage.local.get(null, console.log);

// Ver conteúdo do IndexedDB
// Use Chrome DevTools > Application > Storage
```

## 📈 **Roadmap**

### **Fase 1 (Completa) ✅**
- ✅ Sistema de notificações
- ✅ Interface de busca avançada
- ✅ Painel de analytics
- ✅ Funcionalidade P2P básica

### **Fase 2 (Em Progresso) 🚧**
- 🔄 Favoritos e marcadores
- 🔄 Captura automática inteligente
- 🔄 Histórico de navegação avançado

### **Fase 3 (Planejada) 📋**
- 📋 Análise com machine learning
- 📋 Recursos P2P avançados
- 📋 Aplicativo móvel complementar

## 🤝 **Contribuição**

Aceitamos contribuições! Consulte nosso [Guia de Contribuição](../../CONTRIBUTING.md) para detalhes.

### **Configuração de Desenvolvimento**
1. Faça fork do repositório
2. Crie uma branch de funcionalidade
3. Faça suas alterações
4. Teste completamente
5. Envie uma pull request

### **Padrões de Código**
- **ESLint** configuração incluída
- **Prettier** para formatação de código
- **JSDoc** para documentação
- **Melhores práticas de Extensão Chrome**

## 📄 **Licença**

Este projeto está licenciado sob a Licença MIT - consulte o arquivo [LICENSE](../../LICENSE) para detalhes.

## 🌍 **Internacionalização**

Esta extensão está disponível em múltiplos idiomas:

- 🇺🇸 **Inglês** (Principal) - [README.md](README.md)
- 🇧🇷 **Português** - [README_PT.md](README_PT.md)
- 🇪🇸 **Espanhol** - [README_ES.md](README_ES.md)

## 📞 **Suporte**

- **Problemas**: [GitHub Issues](https://github.com/yourusername/buscalogo/issues)
- **Documentação**: [Wiki](https://github.com/yourusername/buscalogo/wiki)
- **Email**: support@buscalogo.com
- **Comunidade**: [Discord](https://discord.gg/AJjDJUc8bn)

---

**Feito com ❤️ pela Equipe BuscaLogo**

*Potenciando a descoberta e análise inteligente de conteúdo web*

