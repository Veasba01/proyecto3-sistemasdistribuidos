import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import authService from '../services/authService';

export const useAuthStore = defineStore('auth', () => {
  // Estado
  const user = ref(null);
  const token = ref(localStorage.getItem('token') || null);
  const isAuthenticated = computed(() => !!token.value);
  const isLoading = ref(false);
  const error = ref(null);

  // Acciones
  async function login(username, password) {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await authService.login(username, password);
      
      if (response.success) {
        user.value = response.data.user;
        token.value = response.data.token;
        
        // Guardar token en localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        return true;
      } else {
        error.value = response.error;
        return false;
      }
    } catch (err) {
      error.value = err.message || 'Error al iniciar sesión';
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  async function register(userData) {
    isLoading.value = true;
    error.value = null;

    try {
      const response = await authService.register(userData);
      
      if (response.success) {
        user.value = response.data.user;
        token.value = response.data.token;
        
        // Guardar token en localStorage
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        return true;
      } else {
        error.value = response.error;
        return false;
      }
    } catch (err) {
      error.value = err.message || 'Error al registrar usuario';
      return false;
    } finally {
      isLoading.value = false;
    }
  }

  async function verifyToken() {
    if (!token.value) return false;

    try {
      const response = await authService.verifyToken(token.value);
      
      if (response.success) {
        user.value = response.data.user;
        return true;
      } else {
        logout();
        return false;
      }
    } catch (err) {
      logout();
      return false;
    }
  }

  function logout() {
    user.value = null;
    token.value = null;
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  function loadUserFromStorage() {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        user.value = JSON.parse(storedUser);
      } catch (e) {
        console.error('Error al cargar usuario:', e);
      }
    }
  }

  // Cargar usuario al iniciar
  loadUserFromStorage();

  return {
    user,
    token,
    isAuthenticated,
    isLoading,
    error,
    login,
    register,
    logout,
    verifyToken
  };
});
