<template>
  <div class="directores-view">
    <div class="page-header">
      <h1>🎬 Directores de Animación</h1>
      <p>Los maestros detrás de las historias más memorables</p>
      <div class="header-actions">
        <router-link to="/directores/nuevo" class="btn-crear">
          ➕ Nuevo Director
        </router-link>
      </div>
    </div>

    <div v-if="cargando" class="loading">
      ⏳ Cargando directores...
    </div>

    <div v-if="error" class="error">
      ❌ Error: {{ error }}
    </div>

    <div v-if="!cargando && directores.length > 0" class="directores-container">
      <div class="grid">
        <div 
          v-for="director in directoresOrdenados" 
          :key="director._id"
          class="director-card"
        >
          <div class="card-image">
            <img 
              :src="director.imagen || 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjY2NjY2NjIi8+CjxjaXJjbGUgY3g9IjE1MCIgY3k9IjgwIiByPSIzMCIgZmlsbD0iIzk5OTk5OSIvPgo8dGV4dCB4PSIxNTAiIHk9IjE0MCIgZmlsbD0iIzY2NjY2NiIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5EaXJlY3RvcjwvdGV4dD4KPC9zdmc+'" 
              :alt="director.nombre"
              @error="handleImageError"
            >
          </div>
          <div class="card-content">
            <h3>{{ director.nombre }}</h3>
            <p class="nationality">🌍 {{ director.nacionalidad }}</p>
            <p class="birth">📅 Nacido en {{ director.nacimiento }}</p>
            <p class="age">
              👤 {{ new Date().getFullYear() - director.nacimiento }} años
            </p>
            
            <div class="card-actions">
              <button 
                @click="verDetalle(director._id)" 
                class="btn btn-ver-mas"
              >
                Ver más
              </button>
              <button 
                @click="editarDirector(director._id)" 
                class="btn btn-editar"
              >
                ✏️ Editar
              </button>
              <button 
                @click="confirmarEliminar(director)" 
                class="btn btn-eliminar"
              >
                🗑️ Eliminar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de confirmación para eliminar -->
    <div v-if="mostrarModalEliminar" class="modal-overlay" @click="cancelarEliminar">
      <div class="modal" @click.stop>
        <h3>¿Confirmar eliminación?</h3>
        <p>¿Estás seguro de que quieres eliminar al director "<strong>{{ directorAEliminar?.nombre }}</strong>"?</p>
        <p class="warning">Esta acción no se puede deshacer.</p>
        <div class="modal-actions">
          <button @click="cancelarEliminar" class="btn btn-secondary">
            Cancelar
          </button>
          <button @click="eliminarDirector" class="btn btn-danger" :disabled="cargando">
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
import { useDirectoresStore } from '../stores/directores'

const router = useRouter()
const directoresStore = useDirectoresStore()

// Referencias para el modal de eliminar
const mostrarModalEliminar = ref(false)
const directorAEliminar = ref(null)

const directores = computed(() => directoresStore.directores)
const directoresOrdenados = computed(() => directoresStore.directoresOrdenados)
const cargando = computed(() => directoresStore.cargando)
const error = computed(() => directoresStore.error)

const verDetalle = (id) => {
  router.push(`/directores/${id}`)
}

const editarDirector = (id) => {
  router.push(`/directores/${id}/editar`)
}

const confirmarEliminar = (director) => {
  directorAEliminar.value = director
  mostrarModalEliminar.value = true
}

const cancelarEliminar = () => {
  mostrarModalEliminar.value = false
  directorAEliminar.value = null
}

const eliminarDirector = async () => {
  if (!directorAEliminar.value) return
  
  try {
    await directoresStore.eliminarDirector(directorAEliminar.value._id)
    cancelarEliminar()
  } catch (error) {
    console.error('Error eliminando director:', error)
    // El error se mostrará a través del store
  }
}

const handleImageError = (event) => {
  // Usar una imagen de datos SVG como placeholder
  event.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDMwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjY2NjY2NjIi8+CjxjaXJjbGUgY3g9IjE1MCIgY3k9IjgwIiByPSIzMCIgZmlsbD0iIzk5OTk5OSIvPgo8dGV4dCB4PSIxNTAiIHk9IjE0MCIgZmlsbD0iIzY2NjY2NiIgZm9udC1mYW1pbHk9IkFyaWFsLCBzYW5zLXNlcmlmIiBmb250LXNpemU9IjE0IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIj5EaXJlY3RvcjwvdGV4dD4KPC9zdmc+'
}

onMounted(async () => {
  await directoresStore.cargarDirectores()
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

.director-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;
}

.director-card:hover {
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
  font-size: 1.4rem;
  margin-bottom: 1rem;
  color: #333;
}

.nationality {
  color: #667eea;
  font-weight: 500;
  margin: 0.5rem 0;
}

.birth {
  color: #666;
  margin: 0.25rem 0;
}

.age {
  color: #888;
  font-size: 0.9rem;
  margin-bottom: 1rem;
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
</style>