# 🔍 Extensión BuscaLogo - Chrome Extension

[![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)](https://github.com/yourusername/buscalogo)
[![Chrome Extension](https://img.shields.io/badge/Chrome%20Extension-Manifest%20V3-4285F4.svg)](https://developer.chrome.com/docs/extensions/)
[![Language](https://img.shields.io/badge/language-EN-blue.svg)](README.md)
[![Language](https://img.shields.io/badge/language-PT-blue.svg)](README_PT.md)
[![Language](https://img.shields.io/badge/language-ES-blue.svg)](README_ES.md)

> **Extensión de Chrome Inteligente para Colección Automatizada, Análisis y Búsqueda Local de Contenido Web**

## 🌟 **Descripción General**

La Extensión BuscaLogo Chrome es una herramienta poderosa que automáticamente captura, analiza e indexa contenido web mientras navegas. Proporciona capacidades avanzadas de búsqueda local, análisis en tiempo real y procesamiento inteligente de contenido - todo manteniendo tu privacidad con almacenamiento local de datos.

## 🚀 **Características Principales**

### **🔍 Captura Inteligente de Contenido**
- **Detección Automática**: Identifica y captura páginas web relevantes
- **Análisis de Contenido**: Extrae títulos, contenido, metadatos y enlaces
- **Puntuación de Calidad**: Evalúa automáticamente relevancia y calidad del contenido
- **Procesamiento por Lotes**: Sistema basado en cola para captura eficiente

### **📊 Interfaz de Búsqueda Avanzada**
- **Búsqueda Local**: Búsqueda rápida en todo el contenido capturado
- **Filtros Avanzados**: Filtra por tipo de contenido, dominio, fecha y calidad
- **Ordenación Inteligente**: Ordena por relevancia, fecha, título o dominio
- **Paginación**: Navegación eficiente de grandes conjuntos de resultados
- **Resaltado**: Términos de búsqueda resaltados en los resultados

### **📈 Panel de Analytics**
- **Estadísticas en Tiempo Real**: Actualizaciones en vivo de las métricas de captura
- **Gráficos de Rendimiento**: Representación visual de las tendencias de datos
- **Analytics de Almacenamiento**: Monitorea tamaño y uso de la base de datos
- **Capacidades de Exportación**: Descarga de datos en múltiples formatos

### **🔔 Sistema de Notificaciones**
- **Alertas Configurables**: Personaliza preferencias de notificación
- **Notificaciones de Eventos**: Alertas para capturas, progreso de crawling y conexiones
- **Actualizaciones de Badge**: Indicadores visuales en el icono de la extensión
- **Integración del Sistema**: Notificaciones nativas de Chrome

### **🔄 Colaboración P2P**
- **Búsqueda Distribuida**: Comparte y descubre contenido con otros usuarios
- **Sincronización en Tiempo Real**: Actualizaciones en vivo entre pares conectados
- **Privacidad Primero**: Sin recolección central de datos o seguimiento

## 🛠️ **Stack Tecnológico**

- **API de Extensión Chrome** (Manifest V3)
- **JavaScript ES6+** con async/await moderno
- **IndexedDB** para almacenamiento local eficiente
- **Chart.js** para visualización de datos
- **WebSocket** para comunicación en tiempo real
- **Redes P2P** para búsqueda distribuida

## 📦 **Instalación**

### **Prerrequisitos**
- Navegador Chrome/Chromium (versión 88+)
- Modo desarrollador habilitado

### **Pasos de Instalación**

1. **Descargar la Extensión**
   - Clona este repositorio o descarga la carpeta de la extensión
   - Asegúrate de que todos los archivos estén presentes en la carpeta `extension/`

2. **Cargar en Chrome**
   - Abre Chrome y navega a `chrome://extensions/`
   - Habilita "Modo desarrollador" (alternancia en la esquina superior derecha)
   - Haz clic en "Cargar sin comprimir"
   - Selecciona la carpeta `extension/`

3. **Configurar Permisos**
   - La extensión solicitará permisos necesarios
   - Concede acceso al almacenamiento, pestañas activas y notificaciones
   - Revisa y acepta las solicitudes de permiso

4. **Verificar Instalación**
   - Busca el icono BuscaLogo en la barra de herramientas de Chrome
   - Haz clic en el icono para abrir la interfaz popup
   - Verifica que todas las funcionalidades estén accesibles

## 🔧 **Configuración**

### **Configuraciones de Notificación**
```javascript
// Accesible vía interfaz popup
{
  "enabled": true,
  "newPageCaptured": true,
  "crawlingProgress": true,
  "connectionStatus": true,
  "showBadge": true
}
```

### **Configuración de Almacenamiento**
```javascript
// Stores del IndexedDB
- capturedPages: Almacenamiento principal de contenido
- linkIndex: Enlaces descubiertos y metadatos
- contentAnalysis: Puntuaciones de calidad del contenido
- captureQueue: Tareas de captura pendientes
- crawlingStats: Métricas de rendimiento
```

## 📚 **Guía de Uso**

### **Captura Básica de Contenido**

1. **Navega a cualquier página web**
2. **Haz clic en el icono de la extensión** en tu barra de herramientas
3. **Haz clic en "Capturar Página Actual"**
4. **El contenido se procesa automáticamente** y se almacena localmente

### **Búsqueda Avanzada**

1. **Abre la interfaz de búsqueda** vía popup
2. **Digita términos de búsqueda** en la caja de búsqueda
3. **Aplica filtros** (tipo de contenido, dominio, rango de fechas)
4. **Ordena resultados** por relevancia, fecha o calidad
5. **Navega por los resultados** con paginación

### **Panel de Analytics**

1. **Abre el dashboard** vía popup
2. **Ve estadísticas en tiempo real** y métricas
3. **Analiza rendimiento** con gráficos interactivos
4. **Exporta datos** para análisis externo

### **Colaboración P2P**

1. **Conecta al servidor de señalización** (automático)
2. **Descubre otros usuarios** en la red
3. **Comparte contenido** y resultados de búsqueda
4. **Colabora** en el descubrimiento de contenido

## 🧪 **Desarrollo**

### **Estructura del Proyecto**
```
extension/
├── manifest.json          # Manifest de la extensión (V3)
├── background.js          # Service worker
├── content.js            # Script de contenido
├── popup.html            # Interfaz popup
├── popup.js              # Lógica del popup
├── analytics-dashboard.html  # Interfaz de analytics
├── analytics-dashboard.js    # Lógica de analytics
├── search-interface.html     # Interfaz de búsqueda
├── search-interface.js       # Lógica de búsqueda
├── icons/                 # Iconos de la extensión
└── README.md             # Este archivo
```

### **Comandos de Desarrollo**
```bash
# Cargar extensión en modo desarrollo
# 1. Haz cambios en el código
# 2. Ve a chrome://extensions/
# 3. Haz clic en "Recargar" en la extensión
# 4. Prueba los cambios

# Modo debug
# 1. Abre DevTools en el popup de la extensión
# 2. Verifica Console para logs
# 3. Usa pestaña Sources para debugging
```

### **Pruebas**
```bash
# Pruebas manuales
1. Carga extensión en Chrome
2. Prueba todas las funcionalidades manualmente
3. Verifica manejo de errores
4. Verifica rendimiento

# Pruebas automatizadas (planeado)
npm test
```

## 📊 **Métricas de Rendimiento**

- **Velocidad de Captura**: 2-5 segundos por página
- **Eficiencia de Almacenamiento**: ~2KB por página capturada
- **Uso de Memoria**: <50MB para 1000+ páginas
- **Respuesta de Búsqueda**: <100ms para consultas locales
- **Tiempo de Inicio**: <2 segundos

## 🔒 **Privacidad y Seguridad**

### **Almacenamiento de Datos**
- **Solo Local**: Todos los datos almacenados en tu navegador
- **Sin Nube**: Ningún dato enviado a servidores externos
- **IndexedDB**: Almacenamiento local seguro y encriptado
- **Control del Usuario**: Control total sobre datos capturados

### **Permisos**
- **Almacenamiento**: Gestión de datos locales
- **Pestaña Activa**: Captura de contenido de la página actual
- **Scripting**: Análisis dinámico de contenido
- **Notificaciones**: Alertas del usuario y badges

### **Recursos de Seguridad**
- **Sin Seguimiento**: Sin monitoreo del comportamiento del usuario
- **Procesamiento Local**: Todo análisis hecho localmente
- **Comunicación Segura**: WSS para conexiones P2P
- **Código Abierto**: Revisión transparente de código

## 🐛 **Solución de Problemas**

### **Problemas Comunes**

**Extensión no carga**
- Verifica versión de Chrome (88+ necesario)
- Verifica sintaxis del manifest.json
- Limpia caché del navegador y recarga
- Deshabilita extensiones conflictivas

**Errores de permiso**
- Concede todos los permisos solicitados
- Verifica configuraciones de Chrome
- Reinicia navegador si es necesario

**Problemas de almacenamiento**
- Verifica soporte al IndexedDB
- Verifica espacio en disco disponible
- Limpia datos de la extensión si están corruptos

**Problemas de rendimiento**
- Monitorea uso de memoria
- Limita capturas concurrentes
- Limpieza regular de datos

### **Información de Debug**
```javascript
// Habilitar modo debug
localStorage.setItem('debug', 'true');

// Verificar estado del almacenamiento
chrome.storage.local.get(null, console.log);

// Ver contenido del IndexedDB
// Usa Chrome DevTools > Application > Storage
```

## 📈 **Hoja de Ruta**

### **Fase 1 (Completa) ✅**
- ✅ Sistema de notificaciones
- ✅ Interfaz de búsqueda avanzada
- ✅ Panel de analytics
- ✅ Funcionalidad P2P básica

### **Fase 2 (En Progreso) 🚧**
- 🔄 Favoritos y marcadores
- 🔄 Captura automática inteligente
- 🔄 Historial de navegación avanzado

### **Fase 3 (Planeada) 📋**
- 📋 Análisis con machine learning
- 📋 Recursos P2P avanzados
- 📋 Aplicación móvil complementaria

## 🤝 **Contribución**

¡Aceptamos contribuciones! Consulta nuestra [Guía de Contribución](../../CONTRIBUTING.md) para detalles.

### **Configuración de Desarrollo**
1. Haz fork del repositorio
2. Crea una rama de funcionalidad
3. Haz tus cambios
4. Prueba completamente
5. Envía una pull request

### **Estándares de Código**
- **ESLint** configuración incluida
- **Prettier** para formateo de código
- **JSDoc** para documentación
- **Mejores prácticas de Extensión Chrome**

## 📄 **Licencia**

Este proyecto está licenciado bajo la Licencia MIT - consulta el archivo [LICENSE](../../LICENSE) para detalles.

## 🌍 **Internacionalización**

Esta extensión está disponible en múltiples idiomas:

- 🇺🇸 **Inglés** (Principal) - [README.md](README.md)
- 🇧🇷 **Portugués** - [README_PT.md](README_PT.md)
- 🇪🇸 **Español** - [README_ES.md](README_ES.md)

## 📞 **Soporte**

- **Problemas**: [GitHub Issues](https://github.com/yourusername/buscalogo/issues)
- **Documentación**: [Wiki](https://github.com/yourusername/buscalogo/wiki)
- **Email**: support@buscalogo.com
- **Comunidad**: [Discord](https://discord.gg/AJjDJUc8bn)

---

**Hecho con ❤️ por el Equipo BuscaLogo**

*Potenciando el descubrimiento y análisis inteligente de contenido web*

