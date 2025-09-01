#!/bin/bash

# 🚀 Script de Preparação para Publicação - BuscaLogo Extension
# Este script prepara todos os arquivos necessários para publicação na Chrome Web Store

echo "🚀 Preparando BuscaLogo Extension para publicação..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para exibir mensagens coloridas
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Verificar se estamos no diretório correto
if [ ! -f "manifest.json" ]; then
    print_error "Este script deve ser executado no diretório da extensão!"
    exit 1
fi

# Criar diretório de publicação
PUBLISH_DIR="publish"
if [ -d "$PUBLISH_DIR" ]; then
    rm -rf "$PUBLISH_DIR"
fi
mkdir "$PUBLISH_DIR"

print_status "Criando diretório de publicação: $PUBLISH_DIR"

# Copiar arquivos essenciais
print_status "Copiando arquivos essenciais..."

# Arquivos principais
cp manifest.json "$PUBLISH_DIR/"
cp background.js "$PUBLISH_DIR/"
cp content.js "$PUBLISH_DIR/"
cp popup.html "$PUBLISH_DIR/"
cp popup.js "$PUBLISH_DIR/"
cp floating-capture.css "$PUBLISH_DIR/"
cp floating-capture.js "$PUBLISH_DIR/"
cp floating-capture-inline.js "$PUBLISH_DIR/"
cp search-interface.html "$PUBLISH_DIR/"
cp search-interface.js "$PUBLISH_DIR/"
cp analytics-dashboard.html "$PUBLISH_DIR/"
cp analytics-dashboard.js "$PUBLISH_DIR/"
cp storage.indexeddb.js "$PUBLISH_DIR/"

# Diretório de ícones
if [ -d "icons" ]; then
    cp -r icons "$PUBLISH_DIR/"
    print_success "Ícones copiados"
else
    print_warning "Diretório de ícones não encontrado!"
fi

# Verificar arquivos obrigatórios
print_status "Verificando arquivos obrigatórios..."

REQUIRED_FILES=(
    "manifest.json"
    "background.js"
    "content.js"
    "popup.html"
    "popup.js"
    "icons/icon16.png"
    "icons/icon32.png"
    "icons/icon48.png"
    "icons/icon128.png"
)

MISSING_FILES=()

for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "$PUBLISH_DIR/$file" ]; then
        MISSING_FILES+=("$file")
    fi
done

if [ ${#MISSING_FILES[@]} -gt 0 ]; then
    print_error "Arquivos obrigatórios não encontrados:"
    for file in "${MISSING_FILES[@]}"; do
        echo "  - $file"
    done
    exit 1
fi

print_success "Todos os arquivos obrigatórios estão presentes!"

# Criar arquivo ZIP para publicação
ZIP_NAME="buscalogo-extension-v1.0.1.zip"
cd "$PUBLISH_DIR"

print_status "Criando arquivo ZIP: $ZIP_NAME"

if command -v zip &> /dev/null; then
    zip -r "../$ZIP_NAME" . -x "*.DS_Store*" "*.git*"
    print_success "Arquivo ZIP criado: $ZIP_NAME"
else
    print_warning "Comando 'zip' não encontrado. Instale o zip ou crie manualmente."
    print_status "Arquivos estão prontos em: $PUBLISH_DIR"
fi

cd ..

# Criar checklist de publicação
print_status "Criando checklist de publicação..."

cat > "PUBLICATION_CHECKLIST.md" << 'EOF'
# 📋 Checklist de Publicação - BuscaLogo Extension

## ✅ Pré-publicação

### Arquivos Técnicos
- [ ] Manifesto V3 válido
- [ ] Background script funcionando
- [ ] Content script funcionando
- [ ] Popup funcionando
- [ ] Ícones em todos os tamanhos (16, 32, 48, 128)
- [ ] CSS e JS funcionando
- [ ] Permissões justificadas

### Testes
- [ ] Testar em Chrome local
- [ ] Testar funcionalidades principais
- [ ] Verificar compatibilidade
- [ ] Testar em diferentes sites

### Conteúdo da Loja
- [ ] Nome: "BuscaLogo - Buscador Colaborativo P2P"
- [ ] Versão: 1.0.0
- [ ] Descrição detalhada
- [ ] Categoria: Productivity
- [ ] Linguagem: Portuguese (Brazil)

### Imagens
- [ ] Screenshots (1280x800 mínimo)
- [ ] Imagem promocional (440x280)
- [ ] Ícone da extensão (128x128)

## 🚀 Publicação

### Developer Dashboard
- [ ] Acessar [Chrome Web Store Developer Dashboard](https://chrome.google.com/webstore/devconsole/)
- [ ] Fazer login com conta Google
- [ ] Pagar taxa de $5.00 USD (se necessário)
- [ ] Clicar em "Add new item"
- [ ] Upload do arquivo ZIP

### Informações
- [ ] Preencher nome da extensão
- [ ] Adicionar descrição
- [ ] Selecionar categoria
- [ ] Definir idioma
- [ ] Upload de imagens
- [ ] Configurar permissões
- [ ] Adicionar política de privacidade

## 📈 Pós-publicação

### Monitoramento
- [ ] Acompanhar downloads
- [ ] Monitorar avaliações
- [ ] Responder comentários
- [ ] Analisar métricas

### Atualizações
- [ ] Manter versões atualizadas
- [ ] Corrigir bugs rapidamente
- [ ] Adicionar novas funcionalidades
- [ ] Manter compatibilidade

---

**Data de criação**: $(date)
**Versão**: 1.0.0
**Status**: Pronto para publicação
EOF

print_success "Checklist de publicação criado: PUBLICATION_CHECKLIST.md"

# Exibir resumo final
echo ""
echo "🎉 ${GREEN}EXTENSÃO PRONTA PARA PUBLICAÇÃO!${NC}"
echo ""
echo "📁 Diretório de publicação: $PUBLISH_DIR"
echo "📦 Arquivo ZIP: $ZIP_NAME"
echo "📋 Checklist: PUBLICATION_CHECKLIST.md"
echo ""
echo "🚀 ${BLUE}Próximos passos:${NC}"
echo "1. Testar extensão localmente"
echo "2. Acessar Chrome Web Store Developer Dashboard"
echo "3. Fazer upload do arquivo ZIP"
echo "4. Preencher informações da loja"
echo "5. Aguardar aprovação (1-3 dias)"
echo ""
echo "💡 ${YELLOW}Dica:${NC} Use o arquivo STORE_DESCRIPTION.md para a descrição da loja!"
echo ""
print_success "Script concluído com sucesso!"
