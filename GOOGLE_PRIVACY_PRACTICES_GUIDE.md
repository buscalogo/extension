# 📋 Guia para Preencher "Práticas de Privacidade" no Google

## 🎯 **Como Preencher Cada Campo**

### **1. Descrição do Único Propósito**
```
O BuscaLogo é uma extensão de produtividade que permite aos usuários capturar, indexar e buscar páginas web de forma colaborativa usando tecnologia P2P. O único propósito é criar um sistema de busca descentralizado que ajuda usuários a organizar e encontrar informações web de forma eficiente, mantendo todos os dados armazenados localmente no dispositivo do usuário. A extensão usa apenas a permissão activeTab para acesso seguro às páginas, executando apenas quando o usuário solicita explicitamente a captura.
```

### **2. Justificativa para activeTab**
```
A permissão activeTab é a permissão principal e mais segura para nossa funcionalidade. Concede acesso à aba ativa apenas quando o usuário executa um gesto explícito (clica no botão de captura). Permite extrair metadados públicos (título, descrição, headings) da página atual para indexação no sistema de busca local. A execução ocorre apenas em resposta a ação explícita do usuário, tornando a extensão muito mais segura que alternativas com permissões de host amplas.
```

### **3. Justificativa para bookmarks**
```
A permissão bookmarks permite importar favoritos existentes do navegador para o sistema de busca local, facilitando a organização de links já salvos pelo usuário. A extensão apenas lê (não modifica ou deleta) URLs e títulos dos favoritos para indexação local, e esta funcionalidade é completamente opcional e controlada pelo usuário.
```

### **4. Justificativa para notifications**
```
A permissão notifications é usada para exibir notificações informativas sobre o status de captura de páginas e funcionamento do sistema P2P. As notificações incluem: confirmação de captura bem-sucedida, status de conexão P2P, e alertas sobre progresso de indexação. Todas as notificações são configuráveis e podem ser desabilitadas pelo usuário.
```

### **5. Justificativa para scripting**
```
A permissão scripting é necessária para injetar scripts de coleta de dados na aba ativa quando o usuário solicita a captura através de activeTab. O script coleta apenas metadados públicos da página (título, meta tags, headings, links) para indexação local. A execução do script ocorre apenas com consentimento explícito do usuário ao clicar no botão de captura, e é limitada à aba ativa através de activeTab.
```

### **6. Justificativa para storage**
```
A permissão storage é usada para armazenar dados de páginas capturadas, configurações do usuário e histórico de buscas localmente no dispositivo usando IndexedDB. Todos os dados permanecem no dispositivo do usuário e não são transmitidos para servidores externos. O usuário pode limpar todos os dados a qualquer momento através da interface da extensão.
```

### **7. Justificativa para tabs**
```
A permissão tabs permite identificar a aba ativa para captura de dados e abrir interfaces de busca em novas abas. É usada para: detectar URL e título da aba ativa durante a captura, abrir interface de busca avançada em nova aba, e identificar páginas já capturadas para evitar duplicatas. Não monitora navegação ou histórico do usuário.
```

### **8. Justificativa para Código Remoto**
```
A extensão NÃO usa código remoto. Todo o código JavaScript está incluído no pacote da extensão. A conectividade P2P mencionada é apenas para troca de dados de busca entre usuários (URLs, títulos, metadados), não para execução de código remoto. Não há carregamento dinâmico de scripts externos ou execução de código de servidores remotos. A extensão usa apenas activeTab para acesso seguro às páginas, executando scripts apenas na aba ativa quando solicitado pelo usuário.
```

## 📧 **Informações de Contato**

### **Email de Contato**
```
[SEU_EMAIL_AQUI] - exemplo: contato@buscalogo.com
```

### **Site/URL da Política de Privacidade**
```
[URL_ONDE_VOCE_VAI_HOSPEDAR_A_POLITICA] - exemplo: https://buscalogo.com/privacy
```

## ✅ **Conformidade com Políticas**

### **Declaração de Conformidade**
```
Esta extensão está em conformidade com as Políticas do programa para desenvolvedores do Google Chrome. Todos os dados coletados são usados exclusivamente para o propósito declarado (sistema de busca local), são armazenados localmente no dispositivo do usuário, e o usuário mantém controle total sobre seus dados. A extensão usa apenas activeTab para acesso seguro às páginas, executando apenas quando o usuário solicita explicitamente a captura. Não vendemos, compartilhamos ou transferimos dados pessoais para terceiros. A extensão respeita LGPD, GDPR e outras regulamentações de privacidade aplicáveis.
```

## 🔄 **Passo a Passo no Dashboard**

### **1. Acessar Práticas de Privacidade**
- No dashboard, vá para a aba "Práticas de privacidade"
- Preencha cada campo com os textos acima

### **2. Verificar Permissões**
- Confirme que todas as permissões estão listadas
- Adicione as justificativas correspondentes
- **IMPORTANTE**: Não deve haver permissões de host amplas

### **3. Política de Privacidade**
- Hospede o arquivo `privacy-policy.html` em um site
- Adicione a URL no campo correspondente

### **4. Email de Contato**
- Adicione seu email na aba "Conta"
- Verifique o email conforme solicitado

### **5. Salvar Rascunho**
- Salve todas as alterações
- Revise todas as informações

## ⚠️ **Dicas Importantes**

1. **Seja específico**: Use linguagem clara e direta
2. **Mantenha consistência**: As justificativas devem bater com a funcionalidade
3. **Política real**: Hospede a política de privacidade em URL acessível
4. **Email válido**: Use email que você monitora para suporte
5. **Salve frequentemente**: Use "Salvar rascunho" regularmente
6. **Sem host permissions**: A extensão não deve ter permissões de host amplas

## 🎉 **Após Aprovação**

Depois que todas as práticas de privacidade forem aprovadas:
1. A extensão estará pronta para publicação
2. Usuários poderão baixar da Chrome Web Store
3. Monitore reviews e feedbacks
4. Mantenha a política de privacidade atualizada

---

**Importante**: Substitua `[SEU_EMAIL_AQUI]` e `[URL_DA_POLITICA]` pelos seus dados reais antes de enviar!
