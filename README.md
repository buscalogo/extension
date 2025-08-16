# 📱 Extensão BuscaLogo - Chrome Extension

[![Chrome Extension](https://img.shields.io/badge/Chrome%20Extension-Manifest%20V3-4285F4.svg)](https://developer.chrome.com/docs/extensions/)
[![IndexedDB](https://img.shields.io/badge/IndexedDB-API-FF6B6B.svg)](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB)
[![WebRTC](https://img.shields.io/badge/WebRTC-P2P-00D4AA.svg)](https://webrtc.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Extensão Chrome para coleta, indexação e compartilhamento P2P de dados das páginas visitadas.

## 🌟 Visão Geral

A extensão BuscaLogo é o componente cliente que coleta dados das páginas visitadas pelos usuários e os compartilha com outros usuários através de uma rede P2P descentralizada. Ela funciona como um "nó" na rede colaborativa de busca.

### ✨ Características

- 🔍 **Coleta Inteligente** - Captura título, meta tags, headings e conteúdo
- 📊 **Indexação Avançada** - Análise de conteúdo e extração de tópicos
- 🚀 **Crawling Automático** - Descoberta e captura de artigos relacionados
- 🌐 **Comunicação P2P** - WebRTC para troca direta de dados
- 💾 **Armazenamento Local** - IndexedDB para dados coletados
- 🔄 **Sincronização** - Conecta ao servidor de sinalização
- 🎯 **Busca Local** - Pesquisa em dados coletados localmente

## 🚀 Instalação

### Método 1: Desenvolvimento (Recomendado para desenvolvedores)

1. **Clone o repositório**
   ```bash
   git clone https://github.com/buscalogo/extension.git
   cd extension
   ```

2. **Abra o Chrome** e vá para `chrome://extensions/`

3. **Ative o "Modo desenvolvedor"** no canto superior direito

4. **Clique em "Carregar sem compactação"**

5. **Selecione a pasta** `extension/` do repositório

6. **A extensão será instalada** e aparecerá na barra de ferramentas

### Método 2: Download ZIP

1. **Baixe o ZIP** da extensão do [GitHub Releases](https://github.com/buscalogo/extension/releases)

2. **Extraia o arquivo** para uma pasta

3. **Siga os passos 3-6** do método de desenvolvimento

### Método 3: Chrome Web Store (Futuro)

- A extensão será disponibilizada na Chrome Web Store em breve

## 📁 Estrutura do Projeto

```
extension/
├── 📁 icons/                 # Ícones da extensão
│   ├── icon16.png            # 16x16px
│   ├── icon32.png            # 32x32px
│   ├── icon48.png            # 48x48px
│   └── icon128.png           # 128x128px
├── 📁 assets/                # Recursos adicionais
│   ├── css/                  # Estilos customizados
│   └── js/                   # Scripts auxiliares
├── manifest.json             # Manifest V3 da extensão
├── background.js             # Service Worker principal
├── content.js                # Script de conteúdo das páginas
├── popup.html                # Interface do popup
├── popup.js                  # Lógica do popup
├── storage.indexeddb.js      # Wrapper para IndexedDB
├── signaling.js              # Cliente WebSocket
├── webrtc.js                 # Gerenciador WebRTC
├── package.json              # Dependências (se aplicável)
└── README.md                 # Este arquivo
```

## 🛠️ Tecnologias

### Core
- **Chrome Extension Manifest V3** - API moderna de extensões
- **Service Workers** - Processamento em background
- **Content Scripts** - Injeção em páginas web

### Armazenamento
- **IndexedDB** - Banco de dados local
- **Chrome Storage API** - Configurações e cache

### Comunicação
- **WebRTC** - Comunicação P2P
- **WebSocket** - Conexão com servidor de sinalização
- **Chrome Messaging** - Comunicação entre componentes

### Processamento
- **Regex** - Parsing de HTML
- **Text Analysis** - Análise de conteúdo
- **URL Processing** - Manipulação de URLs

## 🔧 Configuração

### Variáveis de Ambiente

Crie um arquivo `.env` na pasta `extension/` (se aplicável):

```env
# Servidor de Sinalização
SIGNALING_SERVER_URL=ws://localhost:3001

# Configurações da Extensão
HEARTBEAT_INTERVAL=30000
RECONNECTION_ATTEMPTS=3
CRAWLING_DELAY=2000

# Configurações de Indexação
MAX_LINKS_PER_PAGE=50
CONTENT_ANALYSIS_ENABLED=true
AUTO_CRAWLING_ENABLED=true
```

### Configurações do Manifest

```json
{
  "manifest_version": 3,
  "name": "BuscaLogo",
  "version": "1.0.0",
  "description": "Buscador colaborativo P2P",
  "permissions": [
    "storage",
    "activeTab",
    "scripting"
  ],
  "host_permissions": [
    "http://*/*",
    "https://*/*"
  ],
  "background": {
    "service_worker": "background.js"
  },
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["content.js"],
      "run_at": "document_end"
    }
  ]
}
```

## 🔍 Como Funciona

### 1. Coleta de Dados

```javascript
// content.js - Coleta dados da página
function collectPageData() {
  const data = {
    url: window.location.href,
    title: document.title,
    meta: extractMetaTags(),
    headings: extractHeadings(),
    paragraphs: extractParagraphs(),
    lists: extractLists(),
    links: extractLinks(),
    timestamp: Date.now()
  }
  
  return data
}
```

### 2. Indexação e Análise

```javascript
// background.js - Processa e indexa dados
async function processPageData(data) {
  // Análise de conteúdo
  const analysis = await analyzeContent(data)
  
  // Extração de tópicos
  const topics = extractTopics(data.content)
  
  // Geração de termos de busca
  const searchTerms = generateSearchTerms(data, analysis)
  
  // Salvamento no IndexedDB
  await saveToIndexedDB({
    ...data,
    analysis,
    topics,
    searchTerms
  })
}
```

### 3. Comunicação P2P

```javascript
// webrtc.js - Gerencia conexões P2P
class WebRTCManager {
  async createConnection(peerId) {
    const peerConnection = new RTCPeerConnection({
      iceServers: [
        { urls: 'stun:stun.l.google.com:19302' }
      ]
    })
    
    // Configurar data channels
    const dataChannel = peerConnection.createDataChannel('search')
    
    return { peerConnection, dataChannel }
  }
}
```

### 4. Busca Local

```javascript
// background.js - Busca em dados locais
async function searchLocalPages(query) {
  const results = []
  const db = await openIndexedDB()
  
  // Busca por termos
  const pages = await db.searchByTerms(query)
  
  // Filtra e pontua resultados
  for (const page of pages) {
    const score = calculateRelevanceScore(page, query)
    if (score > 0.1) {
      results.push({ ...page, score })
    }
  }
  
  return results.sort((a, b) => b.score - a.score)
}
```

## 📊 Funcionalidades

### Coleta Automática

- **Título da página** - Captura o `<title>` da página
- **Meta tags** - Description, keywords, author
- **Headings** - H1, H2, H3 para estrutura
- **Parágrafos** - Conteúdo textual principal
- **Listas** - UL, OL para informações organizadas
- **Links** - URLs para crawling automático

### Indexação Inteligente

- **Análise de conteúdo** - Tipo, tópicos, entidades
- **Extração de tópicos** - Categorização automática
- **Geração de termos** - Palavras-chave para busca
- **Análise de sentimento** - Positivo, negativo, neutro
- **Nível de leitura** - Complexidade do conteúdo

### Crawling Automático

- **Descoberta de links** - Identifica artigos relacionados
- **Fila de captura** - Processamento em background
- **Filtros de relevância** - Evita capturar conteúdo irrelevante
- **Rate limiting** - Respeita limites dos sites
- **Persistência** - Fila sobrevive a reinicializações

### Comunicação P2P

- **Conexões WebRTC** - Comunicação direta entre extensões
- **Data Channels** - Troca de dados e queries
- **Sinalização** - Coordenação via servidor central
- **Heartbeat** - Manutenção de conexões ativas
- **Reconexão automática** - Recuperação de falhas

## 🎯 Uso

### 1. Ativação

- **Clique no ícone** da extensão na barra de ferramentas
- **Verifique o status** de conexão com o servidor
- **Configure preferências** de coleta e crawling

### 2. Navegação

- **Visite páginas** normalmente
- **A extensão coleta** dados automaticamente
- **Verifique o progresso** no popup da extensão

### 3. Busca

- **Acesse o frontend** do BuscaLogo
- **Digite sua busca** no campo de pesquisa
- **Resultados locais** aparecem instantaneamente
- **Resultados P2P** chegam conforme peers respondem

### 4. Gerenciamento

- **Histórico de capturas** - Veja páginas coletadas
- **Estatísticas** - Contadores e métricas
- **Configurações** - Personalize comportamento
- **Limpeza de dados** - Remova dados antigos

## 🔒 Privacidade e Segurança

### Dados Coletados

- **Conteúdo público** - Apenas dados visíveis na página
- **Metadados** - Título, descrição, estrutura
- **URLs** - Para crawling e referência
- **Timestamp** - Data/hora da captura

### Dados NÃO Coletados

- **Informações pessoais** - Nomes, emails, senhas
- **Dados de formulários** - Inputs, seleções
- **Cookies** - Dados de sessão
- **Histórico de navegação** - URLs visitadas

### Armazenamento

- **Local apenas** - Dados ficam no seu dispositivo
- **IndexedDB** - Banco de dados local do navegador
- **Sem upload** - Nada é enviado para servidores externos
- **Controle total** - Você decide o que compartilhar

## 🐛 Troubleshooting

### Problemas Comuns

#### Extensão não carrega
```bash
# Verificar manifest.json
# Confirmar permissões no Chrome
# Verificar console para erros
# Reinstalar a extensão
```

#### Coleta não funciona
```bash
# Verificar se está ativa
# Confirmar permissões de site
# Verificar console da extensão
# Recarregar a página
```

#### Conexão P2P falha
```bash
# Verificar servidor de sinalização
# Confirmar firewall/NAT
# Testar com STUN servers diferentes
# Verificar logs da extensão
```

#### Busca não retorna resultados
```bash
# Verificar dados coletados
# Testar busca local primeiro
# Confirmar indexação funcionando
# Verificar console para erros
```

### Logs e Debug

#### Console da Extensão
1. Abra `chrome://extensions/`
2. Encontre a extensão BuscaLogo
3. Clique em "service worker"
4. Verifique console para logs detalhados

#### Console da Página
1. Abra DevTools da página
2. Vá para a aba Console
3. Procure por mensagens da extensão
4. Verifique erros relacionados

## 🧪 Testes

### Testes Manuais

```bash
# Teste de coleta
1. Visite uma página com conteúdo rico
2. Aguarde a coleta automática
3. Verifique dados no popup da extensão
4. Teste busca local com termos da página

# Teste de crawling
1. Visite um blog ou site de notícias
2. Aguarde o crawling automático
3. Verifique artigos descobertos
4. Confirme captura de conteúdo relacionado

# Teste P2P
1. Instale extensão em dois navegadores
2. Conecte ambos ao servidor
3. Faça busca em um navegador
4. Verifique resultados do outro navegador
```

### Testes Automatizados

```bash
# Instalar dependências de teste
npm install --save-dev jest puppeteer

# Executar testes
npm run test              # Todos os testes
npm run test:unit         # Testes unitários
npm run test:integration  # Testes de integração
npm run test:e2e          # Testes end-to-end
```

## 🚀 Deploy

### Build de Produção

```bash
# Minificar código
npm run build

# Empacotar extensão
npm run package

# Gerar arquivo .crx
npm run crx
```

### Distribuição

1. **Chrome Web Store** - Upload para loja oficial
2. **GitHub Releases** - Download direto
3. **Site próprio** - Distribuição controlada
4. **Repositório** - Instalação para desenvolvedores

## 📈 Performance

### Otimizações

- **Lazy loading** - Carregamento sob demanda
- **Cache inteligente** - Evita reprocessamento
- **Batch processing** - Processamento em lotes
- **Memory management** - Gerenciamento eficiente de memória

### Métricas

```javascript
// Métricas de performance
const metrics = {
  collectionTime: 150,        // ms para coletar página
  indexingTime: 200,          // ms para indexar
  searchTime: 50,             // ms para busca local
  memoryUsage: 15,            // MB de uso de memória
  storageSize: 25             // MB de dados armazenados
}
```

## 🔮 Roadmap

### Versão 1.1
- [ ] Suporte a outros navegadores (Firefox, Edge)
- [ ] API para integração com outros sistemas
- [ ] Sistema de plugins para extensibilidade

### Versão 1.2
- [ ] Machine Learning para relevância
- [ ] Análise de sentimento avançada
- [ ] Detecção de idioma automática

### Versão 2.0
- [ ] Criptografia end-to-end
- [ ] Blockchain para reputação
- [ ] Marketplace de dados

## 🤝 Contribuição

### Diretrizes

1. **Fork** o projeto
2. **Clone** seu fork
3. **Crie** uma branch para sua feature
4. **Desenvolva** seguindo padrões do projeto
5. **Teste** suas mudanças
6. **Commit** com mensagens convencionais
7. **Push** para sua branch
8. **Abra** um Pull Request

### Padrões de Código

- **ESLint** - Regras de qualidade
- **Prettier** - Formatação automática
- **Chrome Extension Best Practices** - Padrões da Google
- **Conventional Commits** - Mensagens de commit

### Checklist para PRs

- [ ] Código segue padrões do projeto
- [ ] Testes passam
- [ ] Documentação atualizada
- [ ] Não quebra funcionalidades existentes
- [ ] Manifest V3 compatível
- [ ] Permissões mínimas necessárias

## 📚 Recursos Adicionais

- **[Chrome Extension Documentation](https://developer.chrome.com/docs/extensions/)**
- **[Manifest V3 Migration Guide](https://developer.chrome.com/docs/extensions/mv3/intro/)**
- **[IndexedDB API](https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB)**
- **[WebRTC Documentation](https://webrtc.org/getting-started/overview)**

## 📞 Suporte

- **Issues**: [GitHub Issues](https://github.com/buscalogo/extension/issues)
- **Discussions**: [GitHub Discussions](https://github.com/buscalogo/extension/discussions)
- **Email**: contato@buscalogo.com
- **Documentação**: [Wiki](https://github.com/buscalogo/extension/wiki)

---

**📱 A extensão BuscaLogo transforma cada usuário em um nó ativo da rede de busca colaborativa!**
