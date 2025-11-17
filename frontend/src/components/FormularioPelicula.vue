<template>
  <div class="formulario-pelicula">
    <h2>{{ esEdicion ? 'Editar Película' : 'Nueva Película' }}</h2>
    
    <form @submit.prevent="guardar" class="form">
      <div class="campo">
        <label for="titulo">Título:</label>
        <input 
          type="text" 
          id="titulo" 
          v-model="pelicula.titulo" 
          required 
          placeholder="Título de la película"
        />
      </div>

      <div class="campo">
        <label for="director_id">Director:</label>
        <select id="director_id" v-model="pelicula.director_id" required>
          <option value="">Selecciona un director</option>
          <option 
            v-for="director in directores" 
            :key="director._id" 
            :value="director._id"
          >
            {{ director.nombre }}
          </option>
        </select>
      </div>

      <div class="campo">
        <label for="estudio_id">Estudio:</label>
        <select id="estudio_id" v-model="pelicula.estudio_id" required>
          <option value="">Selecciona un estudio</option>
          <option 
            v-for="estudio in estudios" 
            :key="estudio._id" 
            :value="estudio._id"
          >
            {{ estudio.nombre }}
          </option>
        </select>
      </div>

      <div class="campo">
        <label for="año">Año:</label>
        <input 
          type="number" 
          id="año" 
          v-model.number="pelicula.año" 
          min="1900" 
          max="2030" 
          required 
        />
      </div>

      <div class="campo">
        <label for="genero">Género:</label>
        <input 
          type="text" 
          id="genero" 
          v-model="pelicula.genero" 
          required 
          placeholder="Ej: Aventura, Fantasía"
        />
      </div>

      <div class="campo">
        <label for="duracion">Duración (minutos):</label>
        <input 
          type="number" 
          id="duracion" 
          v-model.number="pelicula.duracion" 
          min="1" 
          required 
        />
      </div>

      <div class="campo">
        <label for="sinopsis">Sinopsis:</label>
        <textarea 
          id="sinopsis" 
          v-model="pelicula.sinopsis" 
          rows="4" 
          required 
          placeholder="Descripción de la película"
        ></textarea>
      </div>

      <div class="campo">
        <label for="imagen">URL de la imagen:</label>
        <input 
          type="url" 
          id="imagen" 
          v-model="pelicula.imagen" 
          placeholder="https://ejemplo.com/imagen.jpg"
        />
      </div>

      <div class="botones">
        <button type="submit" :disabled="cargando" class="btn-primary">
          {{ cargando ? 'Guardando...' : (esEdicion ? 'Actualizar' : 'Crear') }}
        </button>
        <button type="button" @click="cancelar" class="btn-secondary">
          Cancelar
        </button>
      </div>
    </form>

    <div v-if="error" class="error">
      {{ error }}
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { usePeliculasStore } from '../stores/peliculas.js';
import { useDirectoresStore } from '../stores/directores.js';
import { useEstudiosStore } from '../stores/estudios.js';

export default {
  name: 'FormularioPelicula',
  setup() {
    const router = useRouter();
    const route = useRoute();
    const peliculasStore = usePeliculasStore();
    const directoresStore = useDirectoresStore();
    const estudiosStore = useEstudiosStore();

    const pelicula = ref({
      titulo: '',
      director_id: '',
      estudio_id: '',
      año: new Date().getFullYear(),
      genero: '',
      duracion: null,
      sinopsis: '',
      imagen: ''
    });

    const esEdicion = computed(() => !!route.params.id);
    const cargando = computed(() => peliculasStore.cargando);
    const error = computed(() => peliculasStore.error);
    const directores = computed(() => directoresStore.directores);
    const estudios = computed(() => estudiosStore.estudios);

    onMounted(async () => {
      // Cargar directores y estudios para los selectores
      await directoresStore.cargarDirectores();
      await estudiosStore.cargarEstudios();

      // Si es edición, cargar la película
      if (esEdicion.value) {
        await peliculasStore.cargarPelicula(route.params.id);
        if (peliculasStore.peliculaActual) {
          Object.assign(pelicula.value, peliculasStore.peliculaActual);
        }
      }
    });

    const guardar = async () => {
      try {
        if (esEdicion.value) {
          await peliculasStore.actualizarPelicula(route.params.id, pelicula.value);
        } else {
          await peliculasStore.crearPelicula(pelicula.value);
        }
        router.push('/peliculas');
      } catch (error) {
        console.error('Error guardando película:', error);
      }
    };

    const cancelar = () => {
      router.push('/peliculas');
    };

    return {
      pelicula,
      esEdicion,
      cargando,
      error,
      directores,
      estudios,
      guardar,
      cancelar
    };
  }
};
</script>

<style scoped>
.formulario-pelicula {
  max-width: 600px;
  margin: 20px auto;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.campo {
  display: flex;
  flex-direction: column;
}

.campo label {
  margin-bottom: 5px;
  font-weight: 600;
  color: #333;
}

.campo input,
.campo select,
.campo textarea {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 16px;
}

.campo input:focus,
.campo select:focus,
.campo textarea:focus {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0,123,255,0.25);
}

.botones {
  display: flex;
  gap: 10px;
  justify-content: flex-end;
}

.btn-primary,
.btn-secondary {
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #0056b3;
}

.btn-primary:disabled {
  background-color: #6c757d;
  cursor: not-allowed;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #545b62;
}

.error {
  margin-top: 20px;
  padding: 10px;
  background-color: #f8d7da;
  color: #721c24;
  border: 1px solid #f5c6cb;
  border-radius: 4px;
}

textarea {
  resize: vertical;
  min-height: 100px;
}
</style>