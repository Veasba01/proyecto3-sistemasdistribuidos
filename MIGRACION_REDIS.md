# Migración de MongoDB a Redis - Proyecto 3

## ✅ Cambios Completados

Se ha migrado exitosamente el proyecto de **MongoDB** a **Redis** según los requisitos del Proyecto 3.

### Archivos Modificados

#### 1. **backend/database.js**
- ✅ Cambiado de MongoDB Client a Redis Client
- ✅ Configuración de conexión a Redis Cloud
- ✅ Métodos adaptados para trabajar con key-value storage
- ✅ Funciones helper: `getPelicula()`, `getAllPeliculas()`, `getEstudio()`, etc.

#### 2. **backend/poblar-db.js**
- ✅ Actualizado para poblar Redis con el formato de llaves correcto
- ✅ Llaves tipo: `pelicula_001`, `director_001`, `estudio_001`
- ✅ Los datos se almacenan como JSON stringificado

#### 3. **backend/package.json**
- ✅ Reemplazado `mongodb` por `redis` (v4.6.0)
- ✅ Actualizada la keyword de `mongodb` a `redis`

#### 4. **Funciones Netlify - Versión Simple**
- ✅ `backend/functions/peliculas.js` - CRUD completo con Redis
- ✅ `backend/functions/directores.js` - CRUD completo con Redis
- ✅ `backend/functions/estudios.js` - CRUD completo con Redis

#### 5. **Funciones Netlify - Versión RabbitMQ**
- ✅ `backend/functions/peliculas-rabbitmq.js` - GET desde Redis, POST/PUT/DELETE a RabbitMQ
- ✅ `backend/functions/directores-rabbitmq.js` - GET desde Redis, POST/PUT/DELETE a RabbitMQ
- ✅ `backend/functions/estudios-rabbitmq.js` - GET desde Redis, POST/PUT/DELETE a RabbitMQ

---

## 🔧 Configuración de Redis

### Credenciales
```javascript
{
  username: 'default',
  password: 'OYh0XsNK66Wlv3lcSrMrhkl2PrAFiYsf',
  socket: {
    host: 'redis-14213.c270.us-east-1-3.ec2.cloud.redislabs.com',
    port: 14213
  }
}
```

### Estructura de Llaves en Redis

```
pelicula_001    → {"_id": "pelicula_001", "titulo": "El Viaje de Chihiro", ...}
pelicula_002    → {"_id": "pelicula_002", "titulo": "Toy Story", ...}
...
director_001    → {"_id": "director_001", "nombre": "Hayao Miyazaki", ...}
director_002    → {"_id": "director_002", "nombre": "John Lasseter", ...}
...
estudio_001     → {"_id": "estudio_001", "nombre": "Studio Ghibli", ...}
estudio_002     → {"_id": "estudio_002", "nombre": "Pixar Animation Studios", ...}
```

---

## 📝 Próximos Pasos

### 1. Instalar Dependencias
```powershell
cd backend
npm install
```

### 2. Poblar la Base de Datos Redis
```powershell
cd backend
npm run poblar-db
```

Esto cargará:
- 15 películas
- 10 directores
- 10 estudios

### 3. Probar Localmente (Opcional)
Si tienes las funciones configuradas localmente con Netlify Dev:
```powershell
netlify dev
```

### 4. Desplegar a Netlify
```powershell
# Asegúrate de estar en la raíz del proyecto
netlify deploy --prod
```

### 5. Verificar las Funciones
Una vez desplegado, las funciones estarán disponibles en:
- `https://tu-sitio.netlify.app/.netlify/functions/peliculas`
- `https://tu-sitio.netlify.app/.netlify/functions/directores`
- `https://tu-sitio.netlify.app/.netlify/functions/estudios`

O con RabbitMQ:
- `https://tu-sitio.netlify.app/api/peliculas` (redirige a peliculas-rabbitmq)
- `https://tu-sitio.netlify.app/api/directores` (redirige a directores-rabbitmq)
- `https://tu-sitio.netlify.app/api/estudios` (redirige a estudios-rabbitmq)

---

## 🎯 Operaciones REST Disponibles

### Películas
- `GET /api/peliculas` - Listar todas las películas
- `GET /api/peliculas/pelicula_001` - Obtener película específica
- `POST /api/peliculas` - Crear nueva película (requiere autenticación)
- `PUT /api/peliculas/pelicula_001` - Actualizar película (requiere autenticación)
- `DELETE /api/peliculas/pelicula_001` - Eliminar película (requiere autenticación)

### Directores
- `GET /api/directores` - Listar todos los directores
- `GET /api/directores/director_001` - Obtener director específico
- `POST /api/directores` - Crear nuevo director (requiere autenticación)
- `PUT /api/directores/director_001` - Actualizar director (requiere autenticación)
- `DELETE /api/directores/director_001` - Eliminar director (requiere autenticación)

### Estudios
- `GET /api/estudios` - Listar todos los estudios
- `GET /api/estudios/estudio_001` - Obtener estudio específico
- `POST /api/estudios` - Crear nuevo estudio (requiere autenticación)
- `PUT /api/estudios/estudio_001` - Actualizar estudio (requiere autenticación)
- `DELETE /api/estudios/estudio_001` - Eliminar estudio (requiere autenticación)

---

## ⚠️ Notas Importantes

1. **Frontend**: El frontend de Vue.js no requiere cambios, ya que sigue consumiendo las mismas APIs REST.

2. **Autenticación**: Las operaciones de escritura (POST, PUT, DELETE) requieren autenticación JWT.

3. **RabbitMQ**: Si usas las versiones RabbitMQ, las operaciones de escritura se envían a una cola para procesamiento asíncrono.

4. **IDs Automáticos**: Al crear nuevos registros, el sistema genera IDs secuenciales automáticamente (ej: `pelicula_016`, `director_011`, etc.).

5. **Relaciones**: Los datos mantienen las relaciones mediante IDs:
   - Películas tienen `estudio_id` y `director_id`
   - Al consultar, se enriquecen automáticamente con la información completa

---

## 🚀 Diferencias entre MongoDB y Redis

| Aspecto | MongoDB | Redis |
|---------|---------|-------|
| Tipo | Base de datos documental | Key-Value store |
| Colecciones | `peliculas`, `directores`, `estudios` | No hay colecciones, solo llaves |
| Consultas | `collection.find()`, `findOne()` | `client.get()`, `client.keys()` |
| IDs | `_id` en cada documento | Llaves tipo `pelicula_001` |
| Almacenamiento | Documentos BSON | Strings JSON |
| Relaciones | Lookups automáticos | Manual mediante múltiples `get()` |

---

## ✨ Ventajas de Redis para este Proyecto

- ⚡ **Velocidad**: Operaciones extremadamente rápidas (in-memory)
- 🔑 **Simplicidad**: Key-value perfecto para catálogos
- 💰 **Costo**: Redis Cloud tiene tier gratuito generoso
- 📦 **Ligero**: Menor overhead que MongoDB

---

¡La migración está completa! 🎉
