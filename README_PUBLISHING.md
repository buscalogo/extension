# 🚀 BuscaLogo Extension - Guia de Publicação

## 📋 **Resumo Rápido**

Sua extensão **BuscaLogo** está pronta para publicação na Chrome Web Store! Este guia contém tudo que você precisa saber.

## ⚡ **Passos Rápidos**

### 1. **Preparar Pacote**
```bash
cd extension
./prepare-for-publishing.sh
```

### 2. **Acessar Dashboard**
- Vá para: [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
- Faça login com sua conta Google
- Pague $5.00 USD (taxa única)

### 3. **Publicar**
- Clique em "Add new item"
- Upload do arquivo `buscalogo-extension-v1.0.0.zip`
- Preencha as informações usando `STORE_DESCRIPTION.md`
- Aguarde aprovação (1-3 dias)

## 📁 **Arquivos Criados**

- ✅ `manifest.production.json` - Manifesto otimizado
- ✅ `STORE_DESCRIPTION.md` - Descrição para a loja
- ✅ `PUBLISHING_GUIDE.md` - Guia completo
- ✅ `prepare-for-publishing.sh` - Script de preparação
- ✅ `PUBLICATION_CHECKLIST.md` - Checklist automático

## 🎯 **Informações da Loja**

### **Nome da Extensão**
```
BuscaLogo - Buscador Colaborativo P2P
```

### **Descrição**
Use o conteúdo completo do arquivo `STORE_DESCRIPTION.md`

### **Categoria**
```
Productivity
```

### **Linguagem**
```
Portuguese (Brazil)
```

### **Versão**
```
1.0.0
```

## 🖼️ **Imagens Necessárias**

### **Screenshots (1280x800 mínimo)**
- Popup principal
- Interface de busca
- Dashboard de analytics
- Configurações
- Captura de página

### **Imagem Promocional (440x280)**
- Aparece na página da loja

### **Ícone da Extensão (128x128)**
- Upload do arquivo `icons/icon128.png`

## 🔧 **Permissões Justificadas**

- `storage` - Armazenar dados localmente
- `tabs` - Acessar abas do navegador
- `activeTab` - Executar scripts na aba ativa
- `scripting` - Injetar scripts
- `notifications` - Mostrar notificações
- `bookmarks` - Acessar favoritos

## 📝 **Política de Privacidade**

Crie uma política simples explicando:
- Dados ficam armazenados localmente
- Não coletamos informações pessoais
- Comunicação P2P segura
- Controle total do usuário

## ⚠️ **Possíveis Problemas**

1. **Permissões excessivas** - Justifique cada uma
2. **Screenshots de baixa qualidade** - Use imagens nítidas
3. **Descrição vaga** - Seja específico sobre funcionalidades
4. **Manifesto inválido** - Teste localmente primeiro

## 🎉 **Sucesso!**

Após a aprovação, sua extensão estará disponível para milhões de usuários do Chrome!

---

**Precisa de ajuda?** Consulte o `PUBLISHING_GUIDE.md` para instruções detalhadas.
