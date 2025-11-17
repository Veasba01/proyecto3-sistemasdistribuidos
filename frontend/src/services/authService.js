import apiClient from './api';

const authService = {
  /**
   * Iniciar sesión
   */
  async login(username, password) {
    try {
      const response = await apiClient.post('/auth/login', {
        username,
        password
      });
      return response.data;
    } catch (error) {
      console.error('Error en login:', error);
      throw error.response?.data || { error: 'Error al iniciar sesión' };
    }
  },

  /**
   * Registrar nuevo usuario
   */
  async register(userData) {
    try {
      const response = await apiClient.post('/auth/register', userData);
      return response.data;
    } catch (error) {
      console.error('Error en registro:', error);
      throw error.response?.data || { error: 'Error al registrar usuario' };
    }
  },

  /**
   * Verificar token
   */
  async verifyToken(token) {
    try {
      const response = await apiClient.post('/auth/verify', {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error verificando token:', error);
      throw error.response?.data || { error: 'Token inválido' };
    }
  },

  /**
   * Configurar interceptor para añadir token a todas las peticiones
   */
  setAuthInterceptor() {
    apiClient.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Interceptor para manejar errores de autenticación
    apiClient.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          // Token inválido o expirado
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }
};

// Configurar interceptor al importar el servicio
authService.setAuthInterceptor();

export default authService;
