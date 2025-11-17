<template>
  <div class="register-container">
    <div class="register-card">
      <h1>Crear Cuenta</h1>
      <p class="subtitle">Catálogo de Películas Animadas</p>

      <div v-if="authStore.error" class="error-message">
        {{ authStore.error }}
      </div>

      <form @submit.prevent="handleRegister">
        <div class="form-group">
          <label for="nombre">Nombre Completo</label>
          <input
            id="nombre"
            v-model="formData.nombre"
            type="text"
            required
            placeholder="Tu nombre completo"
            :disabled="authStore.isLoading"
          />
        </div>

        <div class="form-group">
          <label for="username">Usuario</label>
          <input
            id="username"
            v-model="formData.username"
            type="text"
            required
            placeholder="Elige un nombre de usuario"
            :disabled="authStore.isLoading"
          />
        </div>

        <div class="form-group">
          <label for="email">Email</label>
          <input
            id="email"
            v-model="formData.email"
            type="email"
            required
            placeholder="tu@email.com"
            :disabled="authStore.isLoading"
          />
        </div>

        <div class="form-group">
          <label for="password">Contraseña</label>
          <input
            id="password"
            v-model="formData.password"
            type="password"
            required
            placeholder="Mínimo 6 caracteres"
            :disabled="authStore.isLoading"
            minlength="6"
          />
        </div>

        <div class="form-group">
          <label for="confirmPassword">Confirmar Contraseña</label>
          <input
            id="confirmPassword"
            v-model="confirmPassword"
            type="password"
            required
            placeholder="Repite tu contraseña"
            :disabled="authStore.isLoading"
          />
        </div>

        <div v-if="passwordError" class="error-message">
          {{ passwordError }}
        </div>

        <button type="submit" class="btn-primary" :disabled="authStore.isLoading">
          {{ authStore.isLoading ? 'Registrando...' : 'Registrarse' }}
        </button>
      </form>

      <div class="login-link">
        ¿Ya tienes cuenta? 
        <router-link to="/login">Inicia sesión aquí</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const formData = ref({
  nombre: '',
  username: '',
  email: '',
  password: ''
});

const confirmPassword = ref('');

const passwordError = computed(() => {
  if (confirmPassword.value && formData.value.password !== confirmPassword.value) {
    return 'Las contraseñas no coinciden';
  }
  return null;
});

async function handleRegister() {
  if (passwordError.value) {
    return;
  }

  const success = await authStore.register(formData.value);
  
  if (success) {
    router.push('/peliculas');
  }
}
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 20px;
}

.register-card {
  background: white;
  padding: 40px;
  border-radius: 10px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 450px;
}

h1 {
  margin: 0 0 10px 0;
  color: #333;
  text-align: center;
}

.subtitle {
  margin: 0 0 30px 0;
  color: #666;
  text-align: center;
  font-size: 14px;
}

.error-message {
  background-color: #fee;
  color: #c33;
  padding: 12px;
  border-radius: 5px;
  margin-bottom: 20px;
  text-align: center;
  border: 1px solid #fcc;
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  color: #333;
  font-weight: 500;
}

input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 14px;
  transition: border-color 0.3s;
  box-sizing: border-box;
}

input:focus {
  outline: none;
  border-color: #667eea;
}

input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
}

.btn-primary {
  width: 100%;
  padding: 12px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 5px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: transform 0.2s;
  margin-top: 10px;
}

.btn-primary:hover:not(:disabled) {
  transform: translateY(-2px);
}

.btn-primary:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.login-link {
  margin-top: 20px;
  text-align: center;
  color: #666;
  font-size: 14px;
}

.login-link a {
  color: #667eea;
  text-decoration: none;
  font-weight: 600;
}

.login-link a:hover {
  text-decoration: underline;
}
</style>
