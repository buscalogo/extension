# 📋 Justificativas de Práticas de Privacidade - BuscaLogo

## 🎯 **Descrição do Único Propósito**

O BuscaLogo é uma extensão de produtividade que permite aos usuários capturar, indexar e buscar páginas web de forma colaborativa usando tecnologia P2P. O único propósito é criar um sistema de busca descentralizado que ajuda usuários a organizar e encontrar informações web de forma eficiente.

## 🔐 **Justificativas das Permissões**

### **1. activeTab**
**Justificativa**: Esta é a permissão principal e mais segura para nossa funcionalidade. Concede acesso à aba ativa apenas quando o usuário executa um gesto explícito (clica no botão de captura). Permite extrair metadados (título, descrição, headings) da página atual para indexação no sistema de busca local.

**Uso específico**: 
- Coletar dados da página (título, meta tags, conteúdo) apenas quando solicitado
- Injetar interface de captura flutuante na aba ativa
- Executar apenas em resposta a ação explícita do usuário

### **2. bookmarks**
**Justificativa**: Permite importar favoritos do navegador para o sistema de busca local, facilitando a organização de links já salvos pelo usuário.

**Uso específico**:
- Ler favoritos existentes do navegador
- Importar URLs e títulos para indexação local
- Não modifica ou deleta favoritos existentes

### **3. notifications**
**Justificativa**: Exibe notificações informativas sobre o status de captura de páginas e funcionamento do sistema P2P.

**Uso específico**:
- Notificar quando uma página foi capturada com sucesso
- Informar sobre status de conexão P2P
- Alertas sobre progresso de indexação

### **4. scripting**
**Justificativa**: Necessária para injetar scripts de coleta de dados na aba ativa quando o usuário solicita a captura através de `activeTab`.

**Uso específico**:
- Executar script de coleta de metadados da página ativa
- Injetar interface de captura flutuante
- Funciona apenas com consentimento explícito do usuário via `activeTab`

### **5. storage**
**Justificativa**: Armazena dados de páginas capturadas, configurações do usuário e histórico de buscas localmente no dispositivo.

**Uso específico**:
- Salvar páginas indexadas localmente
- Armazenar configurações de notificação
- Manter histórico de capturas e buscas

### **6. tabs**
**Justificativa**: Permite identificar a aba ativa para captura e abrir interfaces de busca em novas abas.

**Uso específico**:
- Detectar URL e título da aba ativa para captura
- Abrir interface de busca em nova aba
- Identificar páginas já capturadas

## 🚫 **Código Remoto**

**Justificativa**: A extensão NÃO usa código remoto. Todo o código JavaScript está incluído no pacote da extensão. A conectividade P2P é apenas para troca de dados de busca entre usuários, não para execução de código remoto.

**Especificação**:
- Todo código está empacotado na extensão
- Conexões WebSocket são apenas para dados, não código
- Não há carregamento dinâmico de scripts externos
- Usa apenas `activeTab` para acesso seguro às páginas

## 🛡️ **Conformidade com Políticas de Dados**

### **Coleta de Dados**
- Coletamos apenas metadados públicos de páginas web
- Não coletamos informações pessoais dos usuários
- Dados ficam armazenados localmente no dispositivo
- Acesso às páginas é controlado por `activeTab` (mais seguro)

### **Uso de Dados**
- Dados são usados exclusivamente para busca e indexação local
- Compartilhamento P2P é opcional e controlado pelo usuário
- Não vendemos ou transferimos dados para terceiros

### **Armazenamento**
- Todos os dados ficam no dispositivo do usuário
- Usar padrão IndexedDB do navegador
- Usuário pode limpar dados a qualquer momento

### **Transparência**
- Interface clara sobre quais dados são coletados
- Usuário controla totalmente o que é capturado
- Configurações de privacidade acessíveis

## 📧 **Política de Privacidade Completa**

Uma política de privacidade detalhada está disponível em: [URL_DA_SUA_POLITICA]

## 📞 **Contato**

Para questões sobre privacidade e dados:
- Email: [SEU_EMAIL_DE_CONTATO]
- Suporte: Disponível através da página da extensão

---

**Última atualização**: Agosto 2024
**Versão**: 1.0.0
