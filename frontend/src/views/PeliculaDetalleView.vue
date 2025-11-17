<template>
  <div class="pelicula-detalle">
    <div v-if="cargando" class="loading">
      ⏳ Cargando película...
    </div>

    <div v-if="error" class="error">
      ❌ Error: {{ error }}
      <button @click="$router.go(-1)" class="btn btn-secondary">Volver</button>
    </div>

    <div v-if="pelicula && !cargando" class="pelicula-info">
      <button @click="$router.go(-1)" class="btn-back">← Volver</button>
      
      <div class="pelicula-header">
        <div class="poster">
          <img 
            :src="pelicula.imagen || '/placeholder-movie.jpg'" 
            :alt="pelicula.titulo"
            @error="handleImageError"
          >
        </div>
        
        <div class="info">
          <h1>{{ pelicula.titulo }}</h1>
          <div class="metadata">
            <span class="year">📅 {{ pelicula.año }}</span>
            <span class="duration">⏱️ {{ pelicula.duracion }} min</span>
            <span class="genre">🎭 {{ pelicula.genero }}</span>
          </div>
          
          <div class="relations">
            <div v-if="pelicula.estudio" class="relation-item">
              <h3>🏢 Estudio</h3>
              <router-link 
                :to="`/estudios/${pelicula.estudio._id}`" 
                class="relation-link"
              >
                {{ pelicula.estudio.nombre }}
              </router-link>
              <p class="relation-detail">
                {{ pelicula.estudio.pais }} ({{ pelicula.estudio.fundacion }})
              </p>
            </div>
            
            <div v-if="pelicula.director" class="relation-item">
              <h3>🎬 Director</h3>
              <router-link 
                :to="`/directores/${pelicula.director._id}`" 
                class="relation-link"
              >
                {{ pelicula.director.nombre }}
              </router-link>
              <p class="relation-detail">
                {{ pelicula.director.nacionalidad }} ({{ pelicula.director.nacimiento }})
              </p>
            </div>
          </div>
        </div>
      </div>
      
      <div class="sinopsis">
        <h2>📖 Sinopsis</h2>
        <p>{{ pelicula.sinopsis }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { usePeliculasStore } from '../stores/peliculas'

const route = useRoute()
const peliculasStore = usePeliculasStore()

const pelicula = computed(() => peliculasStore.peliculaActual)
const cargando = computed(() => peliculasStore.cargando)
const error = computed(() => peliculasStore.error)

const handleImageError = (event) => {
  event.target.src = 'https://via.placeholder.com/400x600/cccccc/666666?text=Sin+Imagen'
}

onMounted(async () => {
  const id = route.params.id
  await peliculasStore.cargarPelicula(id)
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

.pelicula-header {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 2rem;
  margin-bottom: 2rem;
}

.poster img {
  width: 100%;
  border-radius: 12px;
  box-shadow: 0 8px 25px rgba(0,0,0,0.15);
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
  margin-bottom: 2rem;
}

.metadata span {
  background: #f8f9fa;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 500;
}

.relations {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.relation-item {
  background: white;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.relation-item h3 {
  margin-bottom: 0.5rem;
  color: #333;
}

.relation-link {
  color: #667eea;
  text-decoration: none;
  font-weight: bold;
  font-size: 1.1rem;
}

.relation-link:hover {
  text-decoration: underline;
}

.relation-detail {
  color: #666;
  margin-top: 0.25rem;
  font-size: 0.9rem;
}

.sinopsis {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.sinopsis h2 {
  margin-bottom: 1rem;
  color: #333;
}

.sinopsis p {
  line-height: 1.8;
  color: #555;
  font-size: 1.1rem;
}

@media (max-width: 768px) {
  .pelicula-header {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .poster {
    max-width: 250px;
    margin: 0 auto;
  }
  
  .relations {
    grid-template-columns: 1fr;
  }
  
  .info h1 {
    font-size: 2rem;
  }
}
</style>