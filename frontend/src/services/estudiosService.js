import apiClient from './api.js';

export const estudiosService = {
  // Obtener todos los estudios
  async obtenerTodos() {
    try {
      const response = await apiClient.get('/estudios');
      return response.data;
    } catch (error) {
      console.error('Error obteniendo estudios:', error);
      throw error;
    }
  },

  // Obtener un estudio por ID
  async obtenerPorId(id) {
    try {
      const response = await apiClient.get(`/estudios/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error obteniendo estudio:', error);
      throw error;
    }
  },

  // Crear nuevo estudio
  async crear(estudio) {
    try {
      const response = await apiClient.post('/estudios', estudio);
      return response.data;
    } catch (error) {
      console.error('Error creando estudio:', error);
      throw error;
    }
  },

  // Actualizar estudio
  async actualizar(id, estudio) {
    try {
      const response = await apiClient.put(`/estudios/${id}`, estudio);
      return response.data;
    } catch (error) {
      console.error('Error actualizando estudio:', error);
      throw error;
    }
  },

  // Eliminar estudio
  async eliminar(id) {
    try {
      const response = await apiClient.delete(`/estudios/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error eliminando estudio:', error);
      throw error;
    }
  }
};
