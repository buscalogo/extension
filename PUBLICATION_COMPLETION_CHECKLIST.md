# ✅ Checklist de Conclusão da Publicação - BuscaLogo

## 🚨 **URGENTE - Pendências do Google**

### **1. Email de Contato**
- [ ] Ir para aba "Conta" no dashboard
- [ ] Adicionar email de contato válido
- [ ] Verificar email (clicar no link enviado)

### **2. Política de Privacidade**
- [ ] Hospedar o arquivo `privacy-policy.html` online
- [ ] Atualizar `[SEU_EMAIL]` no arquivo com email real
- [ ] Anotar URL onde foi hospedado: ________________

### **3. Práticas de Privacidade**

#### **3.1 Descrição do Único Propósito**
```
O BuscaLogo é uma extensão de produtividade que permite aos usuários capturar, indexar e buscar páginas web de forma colaborativa usando tecnologia P2P. O único propósito é criar um sistema de busca descentralizado que ajuda usuários a organizar e encontrar informações web de forma eficiente, mantendo todos os dados armazenados localmente no dispositivo do usuário. A extensão usa apenas a permissão activeTab para acesso seguro às páginas, executando apenas quando o usuário solicita explicitamente a captura.
```

#### **3.2 Justificativa para activeTab**
```
A permissão activeTab é a permissão principal e mais segura para nossa funcionalidade. Concede acesso à aba ativa apenas quando o usuário executa um gesto explícito (clica no botão de captura). Permite extrair metadados públicos (título, descrição, headings) da página atual para indexação no sistema de busca local. A execução ocorre apenas em resposta a ação explícita do usuário, tornando a extensão muito mais segura que alternativas com permissões de host amplas.
```

#### **3.3 Justificativa para bookmarks**
```
A permissão bookmarks permite importar favoritos existentes do navegador para o sistema de busca local, facilitando a organização de links já salvos pelo usuário. A extensão apenas lê (não modifica ou deleta) URLs e títulos dos favoritos para indexação local, e esta funcionalidade é completamente opcional e controlada pelo usuário.
```

#### **3.4 Justificativa para notifications**
```
A permissão notifications é usada para exibir notificações informativas sobre o status de captura de páginas e funcionamento do sistema P2P. As notificações incluem: confirmação de captura bem-sucedida, status de conexão P2P, e alertas sobre progresso de indexação. Todas as notificações são configuráveis e podem ser desabilitadas pelo usuário.
```

#### **3.5 Justificativa para scripting**
```
A permissão scripting é necessária para injetar scripts de coleta de dados na aba ativa quando o usuário solicita a captura através de activeTab. O script coleta apenas metadados públicos da página (título, meta tags, headings, links) para indexação local. A execução do script ocorre apenas com consentimento explícito do usuário ao clicar no botão de captura, e é limitada à aba ativa através de activeTab.
```

#### **3.6 Justificativa para storage**
```
A permissão storage é usada para armazenar dados de páginas capturadas, configurações do usuário e histórico de buscas localmente no dispositivo usando IndexedDB. Todos os dados permanecem no dispositivo do usuário e não são transmitidos para servidores externos. O usuário pode limpar todos os dados a qualquer momento através da interface da extensão.
```

#### **3.7 Justificativa para tabs**
```
A permissão tabs permite identificar a aba ativa para captura de dados e abrir interfaces de busca em novas abas. É usada para: detectar URL e título da aba ativa durante a captura, abrir interface de busca avançada em nova aba, e identificar páginas já capturadas para evitar duplicatas. Não monitora navegação ou histórico do usuário.
```

#### **3.8 Justificativa para Código Remoto**
```
A extensão NÃO usa código remoto. Todo o código JavaScript está incluído no pacote da extensão. A conectividade P2P mencionada é apenas para troca de dados de busca entre usuários (URLs, títulos, metadados), não para execução de código remoto. Não há carregamento dinâmico de scripts externos ou execução de código de servidores remotos. A extensão usa apenas activeTab para acesso seguro às páginas, executando scripts apenas na aba ativa quando solicitado pelo usuário.
```

### **4. Conformidade de Dados**
```
Esta extensão está em conformidade com as Políticas do programa para desenvolvedores do Google Chrome. Todos os dados coletados são usados exclusivamente para o propósito declarado (sistema de busca local), são armazenados localmente no dispositivo do usuário, e o usuário mantém controle total sobre seus dados. A extensão usa apenas activeTab para acesso seguro às páginas, executando apenas quando o usuário solicita explicitamente a captura. Não vendemos, compartilhamos ou transferimos dados pessoais para terceiros. A extensão respeita LGPD, GDPR e outras regulamentações de privacidade aplicáveis.
```

## 📝 **Passo a Passo**

### **Etapa 1: Preparar Email e Política**
1. [ ] Escolher email de contato profissional
2. [ ] Hospedar `privacy-policy.html` online (GitHub Pages, Netlify, etc.)
3. [ ] Atualizar email no arquivo HTML
4. [ ] Testar se URL da política está acessível

### **Etapa 2: Preencher Dashboard**
1. [ ] Acessar [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
2. [ ] Ir para sua extensão BuscaLogo
3. [ ] Aba "Conta": adicionar e verificar email
4. [ ] Aba "Práticas de privacidade": preencher todos os campos
5. [ ] Adicionar URL da política de privacidade
6. [ ] Copiar textos das justificativas acima
7. [ ] **IMPORTANTE**: Confirmar que não há permissões de host amplas

### **Etapa 3: Salvar e Enviar**
1. [ ] Clicar em "Salvar rascunho" várias vezes
2. [ ] Revisar todas as informações
3. [ ] Clicar em "Enviar para revisão"
4. [ ] Aguardar email de confirmação

## 🎯 **Informações Importantes**

### **Email de Contato Sugerido**
- Use email profissional
- Monitore regularmente
- Exemplo: `contato@seudominio.com` ou `dev@buscalogo.com`

### **Hospedagem da Política**
Opções gratuitas:
- **GitHub Pages**: Fácil e gratuito
- **Netlify**: Deploy automático
- **Vercel**: Rápido e simples
- **Firebase Hosting**: Google Cloud

### **URLs de Exemplo**
- `https://seuusuario.github.io/buscalogo/privacy-policy.html`
- `https://buscalogo.netlify.app/privacy-policy.html`

## ⚠️ **Atenção**

### **Substituir Placeholders**
Antes de usar, substitua:
- `[SEU_EMAIL]` → seu email real
- `[URL_DA_POLITICA]` → URL onde hospedou a política

### **Teste Antes de Enviar**
- [ ] Teste a URL da política em navegador privado
- [ ] Verifique se email está funcionando
- [ ] Revise textos por erros de digitação
- [ ] Confirme que não há permissões de host amplas no manifesto

## 🕐 **Tempo Estimado**

- **Hospedar política**: 15-30 minutos
- **Preencher dashboard**: 30-45 minutos
- **Revisão Google**: 1-3 dias úteis

## 🎉 **Após Aprovação**

Quando aprovado:
1. [ ] Extensão estará na Chrome Web Store
2. [ ] Começar a monitorar downloads e reviews
3. [ ] Responder comentários dos usuários
4. [ ] Planejar próximas atualizações

---

**💡 Dica**: Copie e cole os textos exatamente como estão acima. Eles foram escritos especificamente para atender os requisitos do Google e destacar o uso seguro de activeTab!
