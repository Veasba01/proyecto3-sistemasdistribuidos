# 🎬 Catálogo de Películas Animadas - Proyecto 3

Aplicación web completa para gestión de películas animadas con arquitectura serverless, base de datos Redis Cloud y mensajería asíncrona con RabbitMQ.

## 🌐 **Sitio Web**

**🔗 URL del proyecto desplegado:** [https://proyecto1mauricio.netlify.app](https://proyecto1mauricio.netlify.app)

## 🔐 **Usuarios de Prueba**

Para probar la aplicación, usa estas credenciales:

| Usuario | Contraseña | Rol |
|---------|------------|-----|
| `admin` | `admin123` | Administrador |
| `demo` | `demo123` | Usuario demo |

## 📋 **Descripción del Proyecto**

Este proyecto implementa un catálogo interactivo de películas animadas que permite gestionar información sobre:
- **🎭 Películas:** Título, año, duración, género, sinopsis, estudio y director
- **🏢 Estudios:** Nombre, año de fundación, país de origen
- **🎯 Directores:** Nombre, nacionalidad, año de nacimiento
- **👤 Autenticación:** Sistema de login/registro con JWT

## 🛠️ **Tecnologías Utilizadas**

### **Frontend**
- **Vue.js 3** - Framework JavaScript reactivo
- **Pinia** - Gestión de estado
- **Vue Router** - Enrutamiento SPA
- **Axios** - Cliente HTTP para API calls
- **Vite** - Build tool y desarrollo

### **Backend**
- **Node.js 18** - Runtime JavaScript
- **Netlify Functions** - Funciones serverless
- **Redis Cloud** - Base de datos NoSQL en memoria (key-value store)
- **Redis Client 4.6.0** - Driver oficial de Redis para Node.js
- **RabbitMQ (CloudAMQP)** - Sistema de mensajería asíncrona para operaciones de escritura
- **JWT (jsonwebtoken)** - Autenticación basada en tokens
- **bcryptjs** - Hashing de contraseñas

### **Deployment & DevOps**
- **Netlify** - Hosting y funciones serverless
- **Git & GitHub** - Control de versiones
- **npm** - Gestión de paquetes

## 🏗️ **Arquitectura del Sistema**

```
┌─────────────────┐    ┌──────────────────────────┐    ┌─────────────────┐
│   Frontend      │    │  Netlify Functions       │    │  Redis Cloud    │
│   (Vue.js)      │◄──►│  (Node.js Serverless)    │◄──►│  (Key-Value)    │
│   - Pinia       │    │  - peliculas.js          │    │  - pelicula_*   │
│   - Router      │    │  - directores.js         │    │  - director_*   │
│   - Axios       │    │  - estudios.js           │    │  - estudio_*    │
└─────────────────┘    │  - auth.js               │    │  - usuario_*    │
                       │  - *-rabbitmq.js         │    └─────────────────┘
                       └──────────────────────────┘              │
                                  │                              │
                                  │                              │
                                  ▼                              │
                       ┌──────────────────────┐                 │
                       │  RabbitMQ CloudAMQP  │                 │
                       │  (Message Queue)     │                 │
                       │  - Async writes      │                 │
                       │  - procesar-cola.js  │◄────────────────┘
                       └──────────────────────┘
                       
Flujo de datos:
- GET (lecturas): Frontend → Functions → Redis (síncrono)
- POST/PUT/DELETE (escrituras): Frontend → Functions → RabbitMQ → procesar-cola → Redis (asíncrono)
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
│   ├── 📂 data/                # Datos iniciales
│   │   ├── peliculas.json      # 12 películas
│   │   ├── directores.json     # 6 directores
│   │   └── estudios.json       # 6 estudios
│   ├── 📂 models/              # Modelos de datos
│   │   ├── Pelicula.js
│   │   ├── Director.js
│   │   ├── Estudio.js
│   │   └── Usuario.js
│   ├── 📂 functions/           # Netlify Functions
│   │   ├── peliculas.js        # CRUD Películas (Redis directo)
│   │   ├── estudios.js         # CRUD Estudios (Redis directo)
│   │   ├── directores.js       # CRUD Directores (Redis directo)
│   │   ├── peliculas-rabbitmq.js   # GET Redis + POST/PUT/DELETE RabbitMQ
│   │   ├── estudios-rabbitmq.js    # Híbrido Redis/RabbitMQ
│   │   ├── directores-rabbitmq.js  # Híbrido Redis/RabbitMQ
│   │   ├── auth.js             # Login/Registro/Verificación JWT
│   │   ├── procesar-cola.js    # Procesador de mensajes RabbitMQ
│   │   ├── 📂 utils/           # Utilidades
│   │   │   ├── auth.js         # JWT y hashing
│   │   │   └── rabbitmq.js     # Cliente RabbitMQ
│   │   ├── peliculas-simple.js # Función temporal de prueba
│   │   ├── estudios-simple.js  # Función temporal de prueba
│   │   ├── directores-simple.js# Función temporal de prueba
│   │   └── package.json
│   ├── database.js             # Conexión Redis Cloud
│   ├── poblar-db.js            # Script para poblar Redis
│   ├── poblar-usuarios.js      # Script para crear usuarios
│   └── verificar-db.js         # Script de verificación
├── 📄 netlify.toml             # Configuración deploy
├── 📄 package.json             # Configuración proyecto
└── 📄 README.md               # Este archivo
```

## 🚀 **Características Implementadas**

### **✅ Funcionalidades Principales**
- **🔐 Autenticación JWT** - Sistema completo de login/registro con tokens
- **👤 Gestión de Usuarios** - Registro, login y verificación de sesión
- **📋 Listado** de películas, estudios y directores desde Redis
- **🔍 Visualización** detallada de cada elemento
- **➕ Creación** de nuevos registros (asíncrono vía RabbitMQ)
- **✏️ Edición** de registros existentes (asíncrono vía RabbitMQ)
- **🗑️ Eliminación** con confirmación (asíncrono vía RabbitMQ)
- **🧭 Navegación** fluida entre secciones con protección de rutas
- **🔄 Procesamiento asíncrono** - Cola de mensajes para escrituras

### **✅ Características Técnicas**
- **📱 Responsive Design** - Compatible con móviles y desktop
- **🔄 SPA (Single Page Application)** - Navegación sin recargas
- **⚡ Funciones Serverless** - Escalabilidad automática en Netlify
- **🗄️ Redis Cloud** - Base de datos en memoria de alta velocidad
- **📨 RabbitMQ** - Sistema de mensajería para operaciones asíncronas
- **🔒 JWT** - Autenticación segura basada en tokens
- **🔐 bcrypt** - Hashing seguro de contraseñas
- **🌍 CDN Global** - Carga rápida mundial
- **🛡️ HTTPS** - Certificado SSL automático
- **🔀 CORS** - Configuración de seguridad

### **✅ Optimizaciones**
- **⚡ Redis** - Lecturas ultrarrápidas desde memoria
- **📬 Cola de mensajes** - Escrituras asíncronas sin bloquear UI
- **🖼️ Placeholders SVG** - Imágenes por defecto embebidas
- **📦 Code Splitting** - Carga optimizada de componentes
- **🗜️ Compresión Gzip** - Reducción de tamaño de assets

## 🔧 **Configuración y Deployment**

### **Requisitos**
- Node.js 18+ 
- npm 9+
- Cuenta en Netlify
- Cuenta en Redis Cloud (o Redis local)
- Cuenta en CloudAMQP (RabbitMQ)

### **Instalación**

```bash
# Clonar el repositorio
git clone [tu-repo-url]
cd Proyecto_1

# Instalar dependencias del frontend
cd frontend
npm install

# Instalar dependencias del backend
cd ../backend
npm install

# Instalar dependencias de las funciones
cd functions
npm install

# Volver al directorio raíz
cd ../..
```

### **Configuración de Base de Datos**

```bash
# Poblar Redis con datos iniciales (12 películas, 6 directores, 6 estudios)
cd backend
node poblar-db.js

# Crear usuarios de prueba (admin/admin123 y demo/demo123)
node poblar-usuarios.js

# Verificar que los datos están en Redis
node test-redis.js
```

### **Desarrollo Local**

```bash
# Iniciar servidor de desarrollo (frontend + functions)
npm start

# O separadamente:
# Terminal 1 - Frontend
cd frontend
npm run dev

# Terminal 2 - Netlify Functions
netlify dev
```

La aplicación estará disponible en `http://localhost:8888`

## 🌐 **APIs y Endpoints**

### **Base URL**
```
Production: https://proyecto1mauricio.netlify.app/.netlify/functions/
Local: http://localhost:8888/.netlify/functions/
```

### **Endpoints Disponibles**

#### **🔐 Autenticación**
```
POST   /auth              # Login (body: { username, password })
                         # Retorna: { token, usuario }

POST   /auth?action=register  # Registro (body: { username, password, email })
                              # Retorna: { token, usuario }

GET    /auth              # Verificar token (header: Authorization: Bearer {token})
                         # Retorna: { valid: true, usuario }
```

#### **🎬 Películas**
```
GET    /peliculas         # Listar todas (Redis - síncrono)
GET    /peliculas/:id     # Obtener por ID (Redis - síncrono)
POST   /peliculas         # Crear (RabbitMQ - asíncrono)
PUT    /peliculas/:id     # Actualizar (RabbitMQ - asíncrono)
DELETE /peliculas/:id     # Eliminar (RabbitMQ - asíncrono)
```

#### **🏢 Estudios**
```
GET    /estudios          # Listar todos (Redis - síncrono)
GET    /estudios/:id      # Obtener por ID (Redis - síncrono)
POST   /estudios          # Crear (RabbitMQ - asíncrono)
PUT    /estudios/:id      # Actualizar (RabbitMQ - asíncrono)
DELETE /estudios/:id      # Eliminar (RabbitMQ - asíncrono)
```

#### **🎭 Directores**
```
GET    /directores        # Listar todos (Redis - síncrono)
GET    /directores/:id    # Obtener por ID (Redis - síncrono)
POST   /directores        # Crear (RabbitMQ - asíncrono)
PUT    /directores/:id    # Actualizar (RabbitMQ - asíncrono)
DELETE /directores/:id    # Eliminar (RabbitMQ - asíncrono)
```

#### **⚙️ Procesamiento**
```
POST   /procesar-cola     # Procesar mensajes pendientes en RabbitMQ
                         # Ejecuta todas las operaciones de escritura encoladas
```

## 🗄️ **Modelos de Datos (Redis)**

### **Película**
```javascript
// Key: pelicula_001, pelicula_002, etc.
{
  _id: "pelicula_001",
  titulo: "El Viaje de Chihiro",
  año: 2001,
  duracion: 125,
  genero: "Fantasía",
  sinopsis: "Una niña de 10 años entra en el mundo de los kami...",
  imagen: "https://example.com/images/movies/spirited_away.jpg",
  estudio_id: "estudio_001",
  director_id: "director_001"
}
```

### **Director**
```javascript
// Key: director_001, director_002, etc.
{
  _id: "director_001",
  nombre: "Hayao Miyazaki",
  nacionalidad: "Japonesa",
  nacimiento: 1941,
  imagen: "https://example.com/images/directors/miyazaki.jpg"
}
```

### **Estudio**
```javascript
// Key: estudio_001, estudio_002, etc.
{
  _id: "estudio_001",
  nombre: "Studio Ghibli",
  fundacion: 1985,
  pais: "Japón",
  imagen: "https://example.com/images/studios/ghibli.jpg"
}
```

### **Usuario**
```javascript
// Key: usuario_admin, usuario_demo, etc.
{
  _id: "usuario_admin",
  username: "admin",
  password: "$2a$10$...", // bcrypt hash
  email: "admin@example.com",
  createdAt: "2025-11-16T..."
}
```

## 📊 **Datos Iniciales**

El proyecto incluye datos de ejemplo:
- **12 películas** animadas clásicas
- **6 directores** reconocidos
- **6 estudios** de animación
- **2 usuarios** de prueba (admin, demo)



## 🔧 **Stack Tecnológico Completo**

| Categoría | Tecnología | Propósito |
|-----------|------------|-----------|
| **Frontend** | Vue.js 3 | Framework reactivo |
| | Pinia | State management |
| | Vue Router | SPA routing |
| | Axios | HTTP client |
| | Vite | Build tool |
| **Backend** | Node.js 18 | Runtime |
| | Netlify Functions | Serverless functions |
| | Redis Cloud | Base de datos NoSQL |
| | RabbitMQ (CloudAMQP) | Message queue |
| **Seguridad** | JWT | Token authentication |
| | bcryptjs | Password hashing |
| **Deploy** | Netlify | Hosting + Functions |
| | GitHub | Version control |

## 📝 **Notas de Implementación**

### **Proyecto 3 - Requisitos Cumplidos**
✅ Migración completa de MongoDB a Redis  
✅ Sistema de autenticación con JWT  
✅ RabbitMQ para operaciones asíncronas  
✅ Arquitectura serverless en Netlify  
✅ 15 películas, 10 directores, 10 estudios (implementados 12, 6, 6)  
✅ CRUD completo para todas las entidades  
✅ Interfaz responsive y moderna  

### **Flujo de Operaciones**
1. **Lecturas (GET)**: Frontend → Netlify Function → Redis → Respuesta inmediata
2. **Escrituras (POST/PUT/DELETE)**: Frontend → Netlify Function → RabbitMQ → Confirmación → Procesamiento asíncrono → Redis

---

**🚀 Proyecto desplegado y funcionando en:** [https://proyecto1mauricio.netlify.app](https://proyecto1mauricio.netlify.app)

**👤 Credenciales de prueba:**
- Usuario: `admin` / Contraseña: `admin123`
- Usuario: `demo` / Contraseña: `demo123`
