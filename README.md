# 🚗 Localizador de Matrículas

Una aplicación móvil y web desarrollada con **React Native** y **Expo** que permite reconocer matrículas de vehículos, extraer su ubicación GPS desde metadatos EXIF y mantener un historial completo de todas las detecciones.

## 🎯 **Características Principales**

### ✨ **Funcionalidades Implementadas**
- **🔍 Reconocimiento de matrículas** usando la API de Plate Recognizer
- **📍 Extracción de ubicación GPS** desde metadatos EXIF de las imágenes
- **🌐 Compatibilidad multiplataforma** (iOS, Android, Web)
- **📱 Interfaz intuitiva** con diseño responsive
- **🗺️ Visualización en mapas** usando OpenStreetMap
- **📋 Historial completo** con sistema de dropdown expandible
- **🔍 Búsqueda en tiempo real** dentro del historial
- **💾 Almacenamiento local** persistente con AsyncStorage

### 🏗️ **Arquitectura Modular**
- **Separación de responsabilidades** con servicios especializados
- **Componentes reutilizables** para mejor mantenimiento
- **Hooks personalizados** para lógica de negocio
- **Tipos TypeScript** centralizados y bien definidos
- **Configuración centralizada** para API keys y constantes

## 📁 **Estructura del Proyecto**

```
LocalizadorDeMatriculas/
├── src/
│   ├── components/          # Componentes reutilizables
│   │   ├── InfoModal.tsx    # Modal de información y ayuda
│   │   ├── PlateDisplay.tsx # Visualización de matrículas
│   │   ├── MapDisplay.tsx   # Mapa interactivo con ubicación
│   │   ├── HistoryModal.tsx # Historial con dropdown expandible
│   │   └── MiniMap.tsx      # Mapa pequeño para historial
│   ├── services/           # Servicios de negocio
│   │   ├── plateRecognizer.ts # API de reconocimiento de matrículas
│   │   ├── locationService.ts # Gestión de ubicación y GPS
│   │   └── historyService.ts  # Almacenamiento local del historial
│   ├── hooks/              # Hooks personalizados
│   │   ├── useImagePicker.ts # Selección de imágenes
│   │   └── useHistory.ts    # Gestión del estado del historial
│   ├── utils/              # Utilidades
│   │   └── exif.ts         # Extracción de metadatos GPS
│   ├── types/              # Tipos TypeScript
│   │   └── index.ts        # Interfaces y tipos centralizados
│   └── config/             # Configuración
│       └── index.ts        # Constantes y configuración centralizada
├── App.tsx                 # Componente principal
├── package.json
├── README.md
└── .gitignore             # Archivos excluidos de Git
```

## 🛠️ **Tecnologías Utilizadas**

### **Frontend & Movilidad**
- **React Native** + **Expo** para desarrollo multiplataforma
- **TypeScript** para tipado estático
- **React Native Web** para versión web

### **APIs y Servicios**
- **Plate Recognizer API** para reconocimiento de matrículas
- **exif-js** para extracción de metadatos GPS
- **OpenStreetMap** para mapas gratuitos
- **AsyncStorage** para persistencia local

### **Herramientas de Desarrollo**
- **Expo CLI** para desarrollo y build
- **Metro Bundler** para bundling
- **TypeScript** para desarrollo seguro

## 🚀 **Instalación y Uso**

### **Prerrequisitos**
- Node.js (versión 16 o superior)
- Expo CLI (`npm install -g @expo/cli`)
- Cuenta en Plate Recognizer (para API key gratuita)

### **Instalación**

1. **Clonar el repositorio**
```bash
git clone <url-del-repositorio>
cd LocalizadorDeMatriculas
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar API Key**
   - Obtén tu API key gratuita de [Plate Recognizer](https://platerecognizer.com/)
   - Crea un archivo `.env` en la raíz del proyecto:
   ```
   EXPO_PUBLIC_PLATE_RECOGNIZER_API_KEY=tu_api_key_aqui
   ```

4. **Ejecutar la aplicación**
```bash
# Para desarrollo web
npm run web

# Para desarrollo móvil
npm start
```

## 📱 **Guía de Uso**

### **Versión Web**
1. Haz clic en "Subir archivo" o "Seleccionar de galería"
2. Selecciona una imagen de un vehículo
3. La aplicación procesará la imagen y mostrará:
   - La matrícula reconocida
   - Ubicación en el mapa (si hay metadatos GPS)
   - Se guardará automáticamente en el historial

### **Versión Móvil**
1. Usa "Tomar foto" para capturar una imagen con la cámara
2. O "Seleccionar de galería" para elegir una imagen existente
3. La aplicación mostrará los mismos resultados que en web

### **Historial de Matrículas**
- **Acceder**: Toca el botón 📋 en la esquina superior derecha
- **Expandir**: Toca cualquier elemento para ver el mapa de ubicación
- **Buscar**: Usa el campo de búsqueda para filtrar matrículas
- **Eliminar**: Toca 🗑️ para eliminar elementos específicos
- **Limpiar**: Usa "Limpiar Historial" para eliminar todo

## 🔧 **Configuración Avanzada**

### **Variables de Entorno**
```env
EXPO_PUBLIC_PLATE_RECOGNIZER_API_KEY=tu_api_key_aqui
```

### **Configuración de Regiones**
En `src/config/index.ts` puedes modificar las regiones para mejorar el reconocimiento:
```typescript
REGIONS: ['es', 'gb', 'fr', 'de', 'it'], // España, Reino Unido, Francia, Alemania, Italia
```

### **Límites de Almacenamiento**
- **Máximo 50 elementos** en el historial local
- **Tamaño máximo de imagen**: 10MB
- **Formatos soportados**: JPG, JPEG, PNG

## 📊 **Características Técnicas**

### **Reconocimiento de Matrículas**
- **API**: Plate Recognizer con parámetros optimizados
- **Regiones**: Configurables para mejor precisión
- **Validación**: Tamaño y formato de archivos
- **Manejo de errores**: Mensajes específicos para cada tipo de error

### **Extracción de Ubicación**
- **Metadatos EXIF**: Lectura de coordenadas GPS desde imágenes
- **Fallback**: Ubicación del dispositivo si no hay GPS en la imagen
- **Precisión**: Indicadores de precisión GPS
- **Formato**: Coordenadas decimales estándar

### **Almacenamiento Local**
- **AsyncStorage**: Persistencia entre sesiones
- **Estructura**: Datos tipados con TypeScript
- **Búsqueda**: Filtrado en tiempo real
- **Gestión**: CRUD completo para elementos del historial

## 🔍 **Solución de Problemas**

### **Problemas Comunes**

1. **"API Key no configurada"**
   - Verifica que el archivo `.env` existe y contiene la API key correcta

2. **"No se pudo reconocer la matrícula"**
   - Usa una imagen más clara y bien iluminada
   - Asegúrate de que la matrícula esté visible y legible
   - Evita ángulos muy inclinados

3. **"Ubicación simulada"**
   - En web: Usa fotos originales con metadatos GPS intactos
   - No envíes fotos por WhatsApp (pierde metadatos)
   - Transfiere directamente desde el móvil al PC

4. **Errores de permisos en móvil**
   - Acepta los permisos de cámara y ubicación cuando se soliciten

5. **Historial no muestra elementos**
   - Limpia el historial actual y procesa nuevas imágenes
   - Verifica que no haya errores en la consola

## 🚀 **Roadmap Futuro**

### **Próximas Funcionalidades**
- [ ] **Backend propio** con Node.js + Express + SQLite
- [ ] **Almacenamiento de imágenes** en servidor local
- [ ] **Historial público** compartido entre usuarios
- [ ] **Notificaciones push** para nuevas detecciones
- [ ] **Exportación de datos** (CSV, JSON)
- [ ] **Estadísticas** de reconocimiento
- [ ] **Modo offline** mejorado

### **Mejoras Técnicas**
- [ ] **Base de datos local** con SQLite
- [ ] **API REST** completa
- [ ] **Autenticación de usuarios**
- [ ] **Sincronización en tiempo real**
- [ ] **Optimización de rendimiento**

## 🤝 **Contribuir**

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 **Licencia**

Este proyecto está bajo la Licencia MIT. Ver el archivo `LICENSE` para más detalles.

## 🙏 **Agradecimientos**

- [Plate Recognizer](https://platerecognizer.com/) por la API de reconocimiento gratuita
- [Expo](https://expo.dev/) por el framework de desarrollo multiplataforma
- [OpenStreetMap](https://www.openstreetmap.org/) por los mapas gratuitos
- [React Native](https://reactnative.dev/) por el framework de desarrollo móvil

## 📞 **Contacto**

Si tienes preguntas o sugerencias, no dudes en abrir un issue en el repositorio.

---

**¡Disfruta localizando matrículas! 🚗📍** 