import { defineStore } from 'pinia';
import { directoresService } from '../services/directoresService.js';

export const useDirectoresStore = defineStore('directores', {
  state: () => ({
    directores: [],
    directorActual: null,
    cargando: false,
    error: null
  }),

  getters: {
    directoresOrdenados: (state) => {
      return state.directores.sort((a, b) => a.nombre.localeCompare(b.nombre));
    },

    directorPorId: (state) => (id) => {
      return state.directores.find(director => director._id === id);
    }
  },

  actions: {
    async cargarDirectores() {
      this.cargando = true;
      this.error = null;
      try {
        const response = await directoresService.obtenerTodos();
        this.directores = response.data || response;
      } catch (error) {
        this.error = error.message;
        console.error('Error cargando directores:', error);
      } finally {
        this.cargando = false;
      }
    },

    async cargarDirector(id) {
      this.cargando = true;
      this.error = null;
      try {
        const response = await directoresService.obtenerPorId(id);
        this.directorActual = response.data || response;
      } catch (error) {
        this.error = error.message;
        console.error('Error cargando director:', error);
      } finally {
        this.cargando = false;
      }
    },

    async crearDirector(datosDirector) {
      this.cargando = true;
      this.error = null;
      try {
        const response = await directoresService.crear(datosDirector);
        const nuevoDirector = response.data || response;
        this.directores.push(nuevoDirector);
        return nuevoDirector;
      } catch (error) {
        this.error = error.message;
        console.error('Error creando director:', error);
        throw error;
      } finally {
        this.cargando = false;
      }
    },

    async actualizarDirector(id, datosDirector) {
      this.cargando = true;
      this.error = null;
      try {
        const response = await directoresService.actualizar(id, datosDirector);
        const directorActualizado = response.data || response;
        const index = this.directores.findIndex(d => d._id === id);
        if (index !== -1) {
          this.directores[index] = directorActualizado;
        }
        if (this.directorActual && this.directorActual._id === id) {
          this.directorActual = directorActualizado;
        }
        return directorActualizado;
      } catch (error) {
        this.error = error.message;
        console.error('Error actualizando director:', error);
        throw error;
      } finally {
        this.cargando = false;
      }
    },

    async eliminarDirector(id) {
      this.cargando = true;
      this.error = null;
      try {
        await directoresService.eliminar(id);
        this.directores = this.directores.filter(d => d._id !== id);
        if (this.directorActual && this.directorActual._id === id) {
          this.directorActual = null;
        }
        return true;
      } catch (error) {
        this.error = error.message;
        console.error('Error eliminando director:', error);
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