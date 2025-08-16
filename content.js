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
