<template>
  <div class="formulario-estudio">
    <h2>{{ esEdicion ? 'Editar Estudio' : 'Nuevo Estudio' }}</h2>
    
    <form @submit.prevent="guardar" class="form">
      <div class="campo">
        <label for="nombre">Nombre del estudio:</label>
        <input 
          type="text" 
          id="nombre" 
          v-model="estudio.nombre" 
          required 
          placeholder="Nombre del estudio de animación"
        />
      </div>

      <div class="campo">
        <label for="fundacion">Año de fundación:</label>
        <input 
          type="number" 
          id="fundacion" 
          v-model.number="estudio.fundacion" 
          min="1800" 
          :max="new Date().getFullYear()" 
          required 
        />
      </div>

      <div class="campo">
        <label for="pais">País:</label>
        <input 
          type="text" 
          id="pais" 
          v-model="estudio.pais" 
          required 
          placeholder="País de origen"
        />
      </div>

      <div class="campo">
        <label for="imagen">URL de la imagen:</label>
        <input 
          type="url" 
          id="imagen" 
          v-model="estudio.imagen" 
          placeholder="https://ejemplo.com/logo-estudio.jpg"
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
import { useEstudiosStore } from '../stores/estudios.js';

export default {
  name: 'FormularioEstudio',
  setup() {
    const router = useRouter();
    const route = useRoute();
    const estudiosStore = useEstudiosStore();

    const estudio = ref({
      nombre: '',
      fundacion: new Date().getFullYear(),
      pais: '',
      imagen: ''
    });

    const esEdicion = computed(() => !!route.params.id);
    const cargando = computed(() => estudiosStore.cargando);
    const error = computed(() => estudiosStore.error);

    onMounted(async () => {
      // Si es edición, cargar el estudio
      if (esEdicion.value) {
        await estudiosStore.cargarEstudio(route.params.id);
        if (estudiosStore.estudioActual) {
          Object.assign(estudio.value, estudiosStore.estudioActual);
        }
      }
    });

    const guardar = async () => {
      try {
        if (esEdicion.value) {
          await estudiosStore.actualizarEstudio(route.params.id, estudio.value);
        } else {
          await estudiosStore.crearEstudio(estudio.value);
        }
        router.push('/estudios');
      } catch (error) {
        console.error('Error guardando estudio:', error);
      }
    };

    const cancelar = () => {
      router.push('/estudios');
    };

    return {
      estudio,
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
.formulario-estudio {
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