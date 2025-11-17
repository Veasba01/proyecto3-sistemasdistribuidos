import apiClient from './api.js';

export const directoresService = {
  // Obtener todos los directores
  async obtenerTodos() {
    try {
      const response = await apiClient.get('/directores');
      return response.data;
    } catch (error) {
      console.error('Error obteniendo directores:', error);
      throw error;
    }
  },

  // Obtener un director por ID
  async obtenerPorId(id) {
    try {
      const response = await apiClient.get(`/directores/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo director:', error);
      throw error;
    }
  },

  // Crear nuevo director
  async crear(director) {
    try {
      const response = await apiClient.post('/directores', director);
      return response.data;
    } catch (error) {
      console.error('Error creando director:', error);
      throw error;
    }
  },

  // Actualizar director
  async actualizar(id, director) {
    try {
      const response = await apiClient.put(`/directores/${id}`, director);
      return response.data;
    } catch (error) {
      console.error('Error actualizando director:', error);
      throw error;
    }
  },

  // Eliminar director
  async eliminar(id) {
    try {
      const response = await apiClient.delete(`/directores/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error eliminando director:', error);
      throw error;
    }
  }
};
