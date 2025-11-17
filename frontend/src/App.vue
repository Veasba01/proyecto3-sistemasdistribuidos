<template>
  <div id="app">
    <!-- Header -->
    <header class="header" v-if="authStore.isAuthenticated">
      <div class="container">
        <h1 class="logo">🎬 Catálogo de Películas Animadas</h1>
        <nav class="nav">
          <router-link to="/peliculas" class="nav-link">Películas</router-link>
          <router-link to="/estudios" class="nav-link">Estudios</router-link>
          <router-link to="/directores" class="nav-link">Directores</router-link>
          <div class="user-info">
            <span class="username">👤 {{ authStore.user?.nombre || authStore.user?.username }}</span>
            <button @click="handleLogout" class="btn-logout">Cerrar Sesión</button>
          </div>
        </nav>
      </div>
    </header>

    <!-- Main Content -->
    <main class="main">
      <div :class="authStore.isAuthenticated ? 'container' : ''">
        <router-view />
      </div>
    </main>

    <!-- Footer -->
    <footer class="footer" v-if="authStore.isAuthenticated">
      <div class="container">
        <p>&copy; 2025 Catálogo de Películas Animadas - Proyecto Sistemas Distribuidos</p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router';
import { useAuthStore } from './stores/auth';

const router = useRouter();
const authStore = useAuthStore();

function handleLogout() {
  authStore.logout();
  router.push('/login');
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: 'Arial', sans-serif;
  line-height: 1.6;
  color: #333;
  background-color: #f5f5f5;
}

.container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 20px;
}

/* Header */
.header {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 1rem 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.header .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  font-size: 1.8rem;
  font-weight: bold;
}

.nav {
  display: flex;
  gap: 2rem;
  align-items: center;
}

.nav-link {
  color: white;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.nav-link:hover,
.nav-link.router-link-active {
  background-color: rgba(255, 255, 255, 0.2);
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-left: 1rem;
  padding-left: 1rem;
  border-left: 1px solid rgba(255, 255, 255, 0.3);
}

.username {
  color: white;
  font-weight: 500;
}

.btn-logout {
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.4);
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 14px;
}

.btn-logout:hover {
  background-color: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.6);
}

/* Main Content */
.main {
  min-height: calc(100vh - 140px);
  padding: 2rem 0;
}

/* Footer */
.footer {
  background-color: #333;
  color: white;
  text-align: center;
  padding: 1rem 0;
  margin-top: auto;
}

/* Utility Classes */
.btn {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  background-color: #667eea;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s;
}

.btn:hover {
  background-color: #5a67d8;
}

.btn-secondary {
  background-color: #6c757d;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

.card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 1rem;
}

.loading {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.error {
  background-color: #f8d7da;
  color: #721c24;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-top: 1rem;
}

@media (max-width: 768px) {
  .header .container {
    flex-direction: column;
    gap: 1rem;
  }
  
  .nav {
    flex-wrap: wrap;
    justify-content: center;
  }
  
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
