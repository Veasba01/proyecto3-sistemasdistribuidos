<template>
  <div class="estudio-detalle">
    <div v-if="cargando" class="loading">
      ⏳ Cargando estudio...
    </div>

    <div v-if="error" class="error">
      ❌ Error: {{ error }}
      <button @click="$router.go(-1)" class="btn btn-secondary">Volver</button>
    </div>

    <div v-if="estudio && !cargando" class="estudio-info">
      <button @click="$router.go(-1)" class="btn-back">← Volver a estudios</button>
      
      <div class="estudio-header">
        <div class="logo">
          <img 
            :src="estudio.imagen || '/placeholder-studio.jpg'" 
            :alt="estudio.nombre"
            @error="handleImageError"
          >
        </div>
        
        <div class="info">
          <h1>{{ estudio.nombre }}</h1>
          <div class="metadata">
            <span class="country">🌍 {{ estudio.pais }}</span>
            <span class="founded">📅 Fundado en {{ estudio.fundacion }}</span>
            <span class="years">⏳ {{ new Date().getFullYear() - estudio.fundacion }} años</span>
          </div>
        </div>
      </div>
      
      <div v-if="estudio.peliculas && estudio.peliculas.length > 0" class="peliculas-section">
        <h2>🎬 Películas del Estudio ({{ estudio.peliculas.length }})</h2>
        <div class="peliculas-grid">
          <div 
            v-for="pelicula in estudio.peliculas" 
            :key="pelicula._id"
            class="pelicula-mini-card"
            @click="verPelicula(pelicula._id)"
          >
            <div class="mini-poster">
              <img 
                :src="pelicula.imagen || '/placeholder-movie.jpg'" 
                :alt="pelicula.titulo"
                @error="handlePeliculaImageError"
              >
            </div>
            <div class="mini-info">
              <h4>{{ pelicula.titulo }}</h4>
              <p class="year">{{ pelicula.año }}</p>
              <p class="genre">{{ pelicula.genero }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <div v-else class="no-peliculas">
        📽️ Este estudio aún no tiene películas registradas en nuestro catálogo.
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useEstudiosStore } from '../stores/estudios'

const route = useRoute()
const router = useRouter()
const estudiosStore = useEstudiosStore()

const estudio = computed(() => estudiosStore.estudioActual)
const cargando = computed(() => estudiosStore.cargando)
const error = computed(() => estudiosStore.error)

const verPelicula = (id) => {
  router.push(`/peliculas/${id}`)
}

const handleImageError = (event) => {
  event.target.src = 'https://via.placeholder.com/300x200/cccccc/666666?text=Sin+Logo'
}

const handlePeliculaImageError = (event) => {
  event.target.src = 'https://via.placeholder.com/150x225/cccccc/666666?text=Sin+Imagen'
}

onMounted(async () => {
  const id = route.params.id
  await estudiosStore.cargarEstudio(id)
})
</script>

<style scoped>
.btn-back {
  background: none;
  border: none;
  color: #667eea;
  font-size: 1rem;
  cursor: pointer;
  margin-bottom: 2rem;
  padding: 0.5rem 0;
}

.btn-back:hover {
  text-decoration: underline;
}

.estudio-header {
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 2rem;
  margin-bottom: 3rem;
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
}

.logo img {
  width: 100%;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
}

.info h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #333;
}

.metadata {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

.metadata span {
  background: #f8f9fa;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 500;
}

.peliculas-section {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.peliculas-section h2 {
  margin-bottom: 1.5rem;
  color: #333;
}

.peliculas-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
}

.pelicula-mini-card {
  background: #f8f9fa;
  border-radius: 8px;
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
  cursor: pointer;
}

.pelicula-mini-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.mini-poster {
  height: 120px;
  overflow: hidden;
}

.mini-poster img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.mini-info {
  padding: 1rem;
}

.mini-info h4 {
  font-size: 1rem;
  margin-bottom: 0.5rem;
  color: #333;
}

.year {
  color: #667eea;
  font-weight: bold;
  margin: 0.25rem 0;
}

.genre {
  color: #666;
  font-size: 0.9rem;
}

.no-peliculas {
  background: white;
  padding: 3rem;
  border-radius: 12px;
  text-align: center;
  color: #666;
  font-size: 1.1rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

@media (max-width: 768px) {
  .estudio-header {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .logo {
    max-width: 200px;
    margin: 0 auto;
  }
  
  .peliculas-grid {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
  
  .info h1 {
    font-size: 2rem;
  }
}
</style>