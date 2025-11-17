<template>
  <div class="formulario-director">
    <h2>{{ esEdicion ? 'Editar Director' : 'Nuevo Director' }}</h2>
    
    <form @submit.prevent="guardar" class="form">
      <div class="campo">
        <label for="nombre">Nombre del director:</label>
        <input 
          type="text" 
          id="nombre" 
          v-model="director.nombre" 
          required 
          placeholder="Nombre completo del director"
        />
      </div>

      <div class="campo">
        <label for="nacionalidad">Nacionalidad:</label>
        <input 
          type="text" 
          id="nacionalidad" 
          v-model="director.nacionalidad" 
          required 
          placeholder="País de origen"
        />
      </div>

      <div class="campo">
        <label for="nacimiento">Año de nacimiento:</label>
        <input 
          type="number" 
          id="nacimiento" 
          v-model.number="director.nacimiento" 
          min="1900" 
          :max="new Date().getFullYear()" 
          required 
        />
      </div>

      <div class="campo">
        <label for="imagen">URL de la imagen:</label>
        <input 
          type="url" 
          id="imagen" 
          v-model="director.imagen" 
          placeholder="https://ejemplo.com/foto-director.jpg"
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
import { useDirectoresStore } from '../stores/directores.js';

export default {
  name: 'FormularioDirector',
  setup() {
    const router = useRouter();
    const route = useRoute();
    const directoresStore = useDirectoresStore();

    const director = ref({
      nombre: '',
      nacionalidad: '',
      nacimiento: new Date().getFullYear() - 30,
      imagen: ''
    });

    const esEdicion = computed(() => !!route.params.id);
    const cargando = computed(() => directoresStore.cargando);
    const error = computed(() => directoresStore.error);

    onMounted(async () => {
      // Si es edición, cargar el director
      if (esEdicion.value) {
        await directoresStore.cargarDirector(route.params.id);
        if (directoresStore.directorActual) {
          Object.assign(director.value, directoresStore.directorActual);
        }
      }
    });

    const guardar = async () => {
      try {
        if (esEdicion.value) {
          await directoresStore.actualizarDirector(route.params.id, director.value);
        } else {
          await directoresStore.crearDirector(director.value);
        }
        router.push('/directores');
      } catch (error) {
        console.error('Error guardando director:', error);
      }
    };

    const cancelar = () => {
      router.push('/directores');
    };

    return {
      director,
      esEdicion,
      cargando,
      error,
      guardar,
      cancelar
    };
  }
};
</script>

<style scoped>
.formulario-director {
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
</style>