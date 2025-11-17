import apiClient from './api.js';

export const peliculasService = {
  // Obtener todas las películas
  async obtenerTodas() {
    try {
      const response = await apiClient.get('/peliculas');
      return response.data;
    } catch (error) {
      console.error('Error obteniendo películas:', error);
      throw error;
    }
  },

  // Obtener una película por ID
  async obtenerPorId(id) {
    try {
      const response = await apiClient.get(`/peliculas/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo película:', error);
      throw error;
    }
  },

  // Crear nueva película
  async crear(pelicula) {
    try {
      const response = await apiClient.post('/peliculas', pelicula);
      return response.data;
    } catch (error) {
      console.error('Error creando película:', error);
      throw error;
    }
  },

  // Actualizar película
  async actualizar(id, pelicula) {
    try {
      const response = await apiClient.put(`/peliculas/${id}`, pelicula);
      return response.data;
    } catch (error) {
      console.error('Error actualizando película:', error);
      throw error;
    }
  },

  // Eliminar película
  async eliminar(id) {
    try {
      const response = await apiClient.delete(`/peliculas/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error eliminando película:', error);
      throw error;
    }
  }
};
