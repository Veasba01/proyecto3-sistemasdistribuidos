import { defineStore } from 'pinia';
import { estudiosService } from '../services/estudiosService.js';

export const useEstudiosStore = defineStore('estudios', {
  state: () => ({
    estudios: [],
    estudioActual: null,
    cargando: false,
    error: null
  }),

  getters: {
    estudiosOrdenados: (state) => {
      return state.estudios.sort((a, b) => a.nombre.localeCompare(b.nombre));
    },

    estudioPorId: (state) => (id) => {
      return state.estudios.find(estudio => estudio._id === id);
    }
  },

  actions: {
    async cargarEstudios() {
      this.cargando = true;
      this.error = null;
      try {
        const response = await estudiosService.obtenerTodos();
        this.estudios = response.data || response;
      } catch (error) {
        this.error = error.message;
        console.error('Error cargando estudios:', error);
      } finally {
        this.cargando = false;
      }
    },

    async cargarEstudio(id) {
      this.cargando = true;
      this.error = null;
      try {
        const response = await estudiosService.obtenerPorId(id);
        this.estudioActual = response.data || response;
      } catch (error) {
        this.error = error.message;
        console.error('Error cargando estudio:', error);
      } finally {
        this.cargando = false;
      }
    },

    async crearEstudio(datosEstudio) {
      this.cargando = true;
      this.error = null;
      try {
        const response = await estudiosService.crear(datosEstudio);
        const nuevoEstudio = response.data || response;
        this.estudios.push(nuevoEstudio);
        return nuevoEstudio;
      } catch (error) {
        this.error = error.message;
        console.error('Error creando estudio:', error);
        throw error;
      } finally {
        this.cargando = false;
      }
    },

    async actualizarEstudio(id, datosEstudio) {
      this.cargando = true;
      this.error = null;
      try {
        const response = await estudiosService.actualizar(id, datosEstudio);
        const estudioActualizado = response.data || response;
        const index = this.estudios.findIndex(e => e._id === id);
        if (index !== -1) {
          this.estudios[index] = estudioActualizado;
        }
        if (this.estudioActual && this.estudioActual._id === id) {
          this.estudioActual = estudioActualizado;
        }
        return estudioActualizado;
      } catch (error) {
        this.error = error.message;
        console.error('Error actualizando estudio:', error);
        throw error;
      } finally {
        this.cargando = false;
      }
    },

    async eliminarEstudio(id) {
      this.cargando = true;
      this.error = null;
      try {
        await estudiosService.eliminar(id);
        this.estudios = this.estudios.filter(e => e._id !== id);
        if (this.estudioActual && this.estudioActual._id === id) {
          this.estudioActual = null;
        }
        return true;
      } catch (error) {
        this.error = error.message;
        console.error('Error eliminando estudio:', error);
        throw error;
      } finally {
        this.cargando = false;
      }
    },

    limpiarError() {
      this.error = null;
    }
  }
});