# 🎬 Catálogo de Películas Animadas

El sitio Publicado en NEtlify no corre del todo bien, tuve problemas de los tiempos de respuesta con la base de datos con error 500 timeout por lo cual no se pueden cargar toda la informacion, pero la aplicacion en local si corre con todos los datos

## 🌐 **Sitio Web**

**🔗 URL del proyecto desplegado:** [https://proyecto1mauricio.netlify.app](https://proyecto1mauricio.netlify.app)

## 📋 **Descripción del Proyecto**

Este proyecto implementa un catálogo interactivo de películas animadas que permite gestionar información sobre:
- **🎭 Películas:** Título, año, duración, género, sinopsis
- **🏢 Estudios:** Nombre, año de fundación, país, descripción
- **🎯 Directores:** Nombre, fecha de nacimiento, nacionalidad, biografía

## 🛠️ **Tecnologías Utilizadas**

### **Frontend**
- **Vue.js 3** - Framework JavaScript reactivo
- **Pinia** - Gestión de estado
- **Vue Router** - Enrutamiento SPA
- **Axios** - Cliente HTTP para API calls
- **Vite** - Build tool y desarrollo

### **Backend**
- **Node.js** - Runtime JavaScript
- **Netlify Functions** - Funciones serverless
- **MongoDB Atlas** - Base de datos NoSQL en la nube
- **MongoDB Driver** - Conexión y operaciones de BD

### **Deployment & DevOps**
- **Netlify** - Hosting y funciones serverless
- **Git** - Control de versiones
- **npm** - Gestión de paquetes

## 🏗️ **Arquitectura del Sistema**

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Frontend      │    │  Netlify         │    │  MongoDB        │
│   (Vue.js)      │◄──►│  Functions       │◄──►│  Atlas          │
│                 │    │  (Node.js)       │    │                 │
└─────────────────┘    └──────────────────┘    └─────────────────┘
        │                        │                        │
        │                        │                        │
   ┌────▼────┐            ┌──────▼──────┐         ┌──────▼──────┐
   │ Vite    │            │ API Routes  │         │ Collections │
   │ Build   │            │ CORS        │         │ Documents   │
   │ Static  │            │ Validation  │         │ Indexes     │
   └─────────┘            └─────────────┘         └─────────────┘
```

## 📁 **Estructura del Proyecto**

```
Proyecto_1/
├── 📂 frontend/                 # Aplicación Vue.js
│   ├── 📂 src/
│   │   ├── 📂 components/       # Componentes reutilizables
│   │   │   ├── FormularioPelicula.vue
│   │   │   ├── FormularioEstudio.vue
│   │   │   └── FormularioDirector.vue
│   │   ├── 📂 views/           # Vistas principales
│   │   │   ├── PeliculasView.vue
│   │   │   ├── EstudiosView.vue
│   │   │   └── DirectoresView.vue
│   │   ├── 📂 stores/          # Gestión de estado (Pinia)
│   │   │   ├── peliculas.js
│   │   │   ├── estudios.js
│   │   │   └── directores.js
│   │   ├── 📂 services/        # Servicios API
│   │   │   ├── api.js
│   │   │   ├── peliculasService.js
│   │   │   ├── estudiosService.js
│   │   │   └── directoresService.js
│   │   └── 📂 router/          # Configuración de rutas
│   │       └── index.js
│   ├── 📄 package.json
│   └── 📄 vite.config.js
├── 📂 backend/                  # API Serverless
│   └── 📂 functions/           # Netlify Functions
│       ├── peliculas.js        # CRUD Películas
│       ├── estudios.js         # CRUD Estudios
│       ├── directores.js       # CRUD Directores
│       ├── peliculas-simple.js # Función temporal
│       ├── estudios-simple.js  # Función temporal
│       ├── directores-simple.js# Función temporal
│       └── package.json
├── 📄 netlify.toml             # Configuración deploy
├── 📄 package.json             # Configuración proyecto
└── 📄 README.md               # Este archivo
```

## 🚀 **Características Implementadas**

### **✅ Funcionalidades Principales**
- **📋 Listado** de películas, estudios y directores
- **🔍 Visualización** detallada de cada elemento
- **➕ Creación** de nuevos registros
- **✏️ Edición** de registros existentes
- **🗑️ Eliminación** con confirmación modal
- **🧭 Navegación** fluida entre secciones

### **✅ Características Técnicas**
- **📱 Responsive Design** - Compatible con móviles y desktop
- **🔄 SPA (Single Page Application)** - Navegación sin recargas
- **⚡ Funciones Serverless** - Escalabilidad automática
- **🌍 CDN Global** - Carga rápida mundial
- **🔒 HTTPS** - Certificado SSL automático
- **🛡️ CORS** - Configuración de seguridad

### **✅ Optimizaciones**
- **⏱️ Timeout extendido** - 30s para cold starts
- **🖼️ Placeholders SVG** - Imágenes por defecto
- **📦 Code Splitting** - Carga optimizada
- **🗜️ Compresión Gzip** - Reducción de tamaño

## 🔧 **Configuración y Deployment**

### **Requisitos**
- Node.js 18+ 
- npm 9+
- Cuenta en Netlify
- Cuenta en MongoDB Atlas


# Instalar dependencias del frontend
cd frontend
npm install

# Instalar dependencias de las funciones
cd ../backend/functions
npm install

# Volver al directorio raíz
cd ../..
```

### **Desarrollo Local**
```bash
# Desarrollo del frontend
cd frontend
npm run dev

# Desarrollo con Netlify (en otro terminal)
cd ..
netlify dev
```

## 🌐 **APIs y Endpoints**

### **Base URL**
```
Production: https://proyecto1mauricio.netlify.app/.netlify/functions/
Local: http://localhost:8888/.netlify/functions/
```

### **Endpoints Disponibles**

#### **Películas**
```
GET    /peliculas-simple     # Listar todas las películas
POST   /peliculas           # Crear nueva película
PUT    /peliculas/:id       # Actualizar película
DELETE /peliculas/:id       # Eliminar película
```

#### **Estudios**
```
GET    /estudios-simple     # Listar todos los estudios
POST   /estudios           # Crear nuevo estudio
PUT    /estudios/:id       # Actualizar estudio
DELETE /estudios/:id       # Eliminar estudio
```

#### **Directores**
```
GET    /directores-simple   # Listar todos los directores
POST   /directores         # Crear nuevo director
PUT    /directores/:id     # Actualizar director
DELETE /directores/:id     # Eliminar director
```

## 🗄️ **Modelos de Datos**

### **Película**
```javascript
{
  _id: String,
  titulo: String,
  anio: Number,
  duracion: Number,
  genero: String,
  director: {
    _id: ObjectId,
    nombre: String
  },
  estudio: {
    _id: ObjectId,
    nombre: String
  },
  sinopsis: String,
  imagenUrl: String
}
```

### **Estudio**
```javascript
{
  _id: String,
  nombre: String,
  fundacion: Number,
  pais: String,
  descripcion: String
}
```

### **Director**
```javascript
{
  _id: String,
  nombre: String,
  fechaNacimiento: String,
  nacionalidad: String,
  biografia: String
}
```



---

**🚀 Proyecto desplegado y funcionando en:** [https://proyecto1mauricio.netlify.app](https://proyecto1mauricio.netlify.app)
