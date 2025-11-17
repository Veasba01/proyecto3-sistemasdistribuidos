<template>
  <div class="peliculas-view">
    <div class="page-header">
      <h1>🎬 Películas Animadas</h1>
      <p>Descubre nuestro catálogo completo de películas animadas</p>
      <div class="header-actions">
        <router-link to="/peliculas/nueva" class="btn-crear">
          ➕ Nueva Película
        </router-link>
      </div>
    </div>

    <div v-if="cargando" class="loading">
      ⏳ Cargando películas...
    </div>

    <div v-if="error" class="error">
      ❌ Error: {{ error }}
    </div>

    <div v-if="!cargando && peliculas.length > 0" class="peliculas-container">
      <div class="filters">
        <input 
          v-model="filtroTitulo" 
          type="text" 
          placeholder="Buscar por título..."
          class="search-input"
        >
        <select v-model="filtroGenero" class="filter-select">
          <option value="">Todos los géneros</option>
          <option v-for="genero in generosUnicos" :key="genero" :value="genero">
            {{ genero }}
          </option>
        </select>
      </div>

      <div class="grid">
        <div 
          v-for="pelicula in peliculasFiltradas" 
          :key="pelicula._id"
          class="pelicula-card"
        >
          <div class="card-image">
            <img 
              :src="pelicula.imagen || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIgdmlld0JveD0iMCAwIDMwMCA0NTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iNDUwIiBmaWxsPSIjY2NjY2NjIi8+CjxyZWN0IHg9IjEwMCIgeT0iMTc1IiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzk5OTk5OSIvPgo8dGV4dCB4PSIxNTAiIHk9IjI2MCIgZmlsbD0iIzY2NjY2NiIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5TaW4gSW1hZ2VuPC90ZXh0Pgo8L3N2Zz4='" 
              :alt="pelicula.titulo"
              @error="handleImageError"
            >
          </div>
          <div class="card-content">
            <h3>{{ pelicula.titulo }}</h3>
            <p class="year">{{ pelicula.año }}</p>
            <p class="genre">{{ pelicula.genero }}</p>
            <p class="duration">⏱️ {{ pelicula.duracion }} min</p>
            
            <div class="metadata">
              <p v-if="pelicula.estudio" class="studio">
                🏢 {{ pelicula.estudio.nombre }}
              </p>
              <p v-if="pelicula.director" class="director">
                🎬 {{ pelicula.director.nombre }}
              </p>
            </div>
            
            <div class="card-actions">
              <button 
                @click="verDetalle(pelicula._id)" 
                class="btn btn-ver-mas"
              >
                Ver más
              </button>
              <button 
                @click="editarPelicula(pelicula._id)" 
                class="btn btn-editar"
              >
                ✏️ Editar
              </button>
              <button 
                @click="confirmarEliminar(pelicula)" 
                class="btn btn-eliminar"
              >
                🗑️ Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="peliculasFiltradas.length === 0" class="no-results">
        🔍 No se encontraron películas con esos criterios
      </div>
    </div>

    <!-- Modal de confirmación para eliminar -->
    <div v-if="mostrarModalEliminar" class="modal-overlay" @click="cancelarEliminar">
      <div class="modal" @click.stop>
        <h3>¿Confirmar eliminación?</h3>
        <p>¿Estás seguro de que quieres eliminar la película "<strong>{{ peliculaAEliminar?.titulo }}</strong>"?</p>
        <p class="warning">Esta acción no se puede deshacer.</p>
        <div class="modal-actions">
          <button @click="cancelarEliminar" class="btn btn-secondary">
            Cancelar
          </button>
          <button @click="eliminarPelicula" class="btn btn-danger" :disabled="cargando">
            {{ cargando ? 'Eliminando...' : 'Eliminar' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { usePeliculasStore } from '../stores/peliculas'

const router = useRouter()
const peliculasStore = usePeliculasStore()

// Referencias reactivas para filtros
const filtroTitulo = ref('')
const filtroGenero = ref('')

// Referencias para el modal de eliminar
const mostrarModalEliminar = ref(false)
const peliculaAEliminar = ref(null)

// Computed properties
const peliculas = computed(() => peliculasStore.peliculas)
const cargando = computed(() => peliculasStore.cargando)
const error = computed(() => peliculasStore.error)

const generosUnicos = computed(() => {
  const generos = peliculas.value.map(p => p.genero)
  return [...new Set(generos)].sort()
})

const peliculasFiltradas = computed(() => {
  let resultado = peliculas.value

  if (filtroTitulo.value) {
    resultado = resultado.filter(p => 
      p.titulo.toLowerCase().includes(filtroTitulo.value.toLowerCase())
    )
  }

  if (filtroGenero.value) {
    resultado = resultado.filter(p => p.genero === filtroGenero.value)
  }

  return resultado
})

// Métodos
const verDetalle = (id) => {
  router.push(`/peliculas/${id}`)
}

const editarPelicula = (id) => {
  router.push(`/peliculas/${id}/editar`)
}

const confirmarEliminar = (pelicula) => {
  peliculaAEliminar.value = pelicula
  mostrarModalEliminar.value = true
}

const cancelarEliminar = () => {
  mostrarModalEliminar.value = false
  peliculaAEliminar.value = null
}

const eliminarPelicula = async () => {
  if (!peliculaAEliminar.value) return
  
  try {
    await peliculasStore.eliminarPelicula(peliculaAEliminar.value._id)
    cancelarEliminar()
  } catch (error) {
    console.error('Error eliminando película:', error)
    // El error se mostrará a través del store
  }
}

const handleImageError = (event) => {
  // Usar una imagen de datos SVG como placeholder
  event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjQ1MCIgdmlld0JveD0iMCAwIDMwMCA0NTAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iNDUwIiBmaWxsPSIjY2NjY2NjIi8+CjxyZWN0IHg9IjEwMCIgeT0iMTc1IiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0iIzk5OTk5OSIvPgo8dGV4dCB4PSIxNTAiIHk9IjI2MCIgZmlsbD0iIzY2NjY2NiIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE2IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5TaW4gSW1hZ2VuPC90ZXh0Pgo8L3N2Zz4='
}

// Lifecycle
onMounted(async () => {
  await peliculasStore.cargarPeliculas()
})
</script>

<style scoped>
.page-header {
  text-align: center;
  margin-bottom: 2rem;
  position: relative;
}

.header-actions {
  position: absolute;
  top: 0;
  right: 0;
}

.btn-crear {
  background-color: #28a745;
  color: white;
  padding: 10px 20px;
  border-radius: 5px;
  text-decoration: none;
  font-weight: 600;
  transition: background-color 0.2s;
}

.btn-crear:hover {
  background-color: #218838;
}

.page-header h1 {
  font-size: 2.5rem;
  margin-bottom: 0.5rem;
  color: #333;
}

.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
}

.search-input,
.filter-select {
  padding: 0.75rem;
  border: 2px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.search-input {
  flex: 1;
  min-width: 250px;
}

.filter-select {
  min-width: 200px;
}

.pelicula-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;
}

.pelicula-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
}

.card-image {
  height: 200px;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-content {
  padding: 1.5rem;
}

.card-content h3 {
  font-size: 1.3rem;
  margin-bottom: 0.5rem;
  color: #333;
}

.year {
  font-size: 1.1rem;
  color: #666;
  font-weight: bold;
}

.genre {
  color: #667eea;
  font-weight: 500;
  margin: 0.25rem 0;
}

.duration {
  color: #888;
  font-size: 0.9rem;
}

.metadata {
  margin: 1rem 0;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.studio,
.director {
  font-size: 0.9rem;
  color: #555;
  margin: 0.25rem 0;
}

.btn-ver-mas {
  background-color: #007bff;
  color: white;
}

.btn-editar {
  background-color: #ffc107;
  color: #212529;
}

.btn-eliminar {
  background-color: #dc3545;
  color: white;
}

.btn-ver-mas:hover {
  background-color: #0056b3;
}

.btn-editar:hover {
  background-color: #e0a800;
}

.btn-eliminar:hover {
  background-color: #c82333;
}

.card-actions {
  display: flex;
  gap: 5px;
  margin-top: 1rem;
}

.card-actions .btn {
  flex: 1;
  padding: 8px 5px;
  font-size: 0.85rem;
}

/* Modal estilos */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.modal {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  max-width: 400px;
  width: 90%;
  text-align: center;
}

.modal h3 {
  margin-bottom: 1rem;
  color: #333;
}

.modal p {
  margin-bottom: 1rem;
  color: #666;
}

.warning {
  color: #dc3545 !important;
  font-weight: 600;
}

.modal-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 1.5rem;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #545b62;
}

.btn-danger {
  background-color: #dc3545;
  color: white;
}

.btn-danger:hover:not(:disabled) {
  background-color: #c82333;
}

.btn-danger:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.no-results {
  text-align: center;
  padding: 3rem;
  color: #666;
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .filters {
    flex-direction: column;
  }
  
  .search-input,
  .filter-select {
    min-width: 100%;
  }
}
</style>