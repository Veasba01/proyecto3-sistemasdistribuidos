import { defineStore } from 'pinia';
import { peliculasService } from '../services/peliculasService.js';

export const usePeliculasStore = defineStore('peliculas', {
  state: () => ({
    peliculas: [],
    peliculaActual: null,
    cargando: false,
    error: null
  }),

  getters: {
    peliculasPorEstudio: (state) => (estudioId) => {
      return state.peliculas.filter(pelicula => pelicula.estudio_id === estudioId);
    },
    
    peliculasPorDirector: (state) => (directorId) => {
      return state.peliculas.filter(pelicula => pelicula.director_id === directorId);
    },

    peliculasPorGenero: (state) => (genero) => {
      return state.peliculas.filter(pelicula => 
        pelicula.genero.toLowerCase().includes(genero.toLowerCase())
      );
    }
  },

  actions: {
    async cargarPeliculas() {
      this.cargando = true;
      this.error = null;
      try {
        const response = await peliculasService.obtenerTodas();
        this.peliculas = response.data || response;
      } catch (error) {
        this.error = error.message;
        console.error('Error cargando películas:', error);
      } finally {
        this.cargando = false;
      }
    },

    async cargarPelicula(id) {
      this.cargando = true;
      this.error = null;
      try {
        const response = await peliculasService.obtenerPorId(id);
        this.peliculaActual = response.data || response;
      } catch (error) {
        this.error = error.message;
        console.error('Error cargando película:', error);
      } finally {
        this.cargando = false;
      }
    },

    async crearPelicula(pelicula) {
      this.cargando = true;
      this.error = null;
      try {
        const resultado = await peliculasService.crear(pelicula);
        await this.cargarPeliculas(); // Recargar la lista
        return resultado;
      } catch (error) {
        this.error = error.message;
        console.error('Error creando película:', error);
        throw error;
      } finally {
        this.cargando = false;
      }
    },

    async actualizarPelicula(id, pelicula) {
      this.cargando = true;
      this.error = null;
      try {
        const resultado = await peliculasService.actualizar(id, pelicula);
        await this.cargarPeliculas(); // Recargar la lista
        return resultado;
      } catch (error) {
        this.error = error.message;
        console.error('Error actualizando película:', error);
        throw error;
      } finally {
        this.cargando = false;
      }
    },

    async eliminarPelicula(id) {
      this.cargando = true;
      this.error = null;
      try {
        const resultado = await peliculasService.eliminar(id);
        await this.cargarPeliculas(); // Recargar la lista
        return resultado;
      } catch (error) {
        this.error = error.message;
        console.error('Error eliminando película:', error);
        throw error;
      } finally {
        this.cargando = false;
      }
    }
  }
});
