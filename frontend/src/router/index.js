import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      redirect: '/peliculas'
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('../views/LoginView.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('../views/RegisterView.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/peliculas',
      name: 'peliculas',
      component: () => import('../views/PeliculasView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/peliculas/nueva',
      name: 'pelicula-nueva',
      component: () => import('../components/FormularioPelicula.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/peliculas/:id/editar',
      name: 'pelicula-editar',
      component: () => import('../components/FormularioPelicula.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/peliculas/:id',
      name: 'pelicula-detalle',
      component: () => import('../views/PeliculaDetalleView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/estudios',
      name: 'estudios',
      component: () => import('../views/EstudiosView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/estudios/crear',
      name: 'crear-estudio',
      component: () => import('../components/FormularioEstudio.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/estudios/editar/:id',
      name: 'editar-estudio',
      component: () => import('../components/FormularioEstudio.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/estudios/:id',
      name: 'estudio-detalle',
      component: () => import('../views/EstudioDetalleView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/directores',
      name: 'directores',
      component: () => import('../views/DirectoresView.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/directores/crear',
      name: 'crear-director',
      component: () => import('../components/FormularioDirector.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/directores/editar/:id',
      name: 'editar-director',
      component: () => import('../components/FormularioDirector.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/directores/:id',
      name: 'director-detalle',
      component: () => import('../views/DirectorDetalleView.vue'),
      meta: { requiresAuth: true }
    }
  ]
})

// Guard de navegación para proteger rutas
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  // Verificar si la ruta requiere autenticación
  if (to.meta.requiresAuth) {
    if (!authStore.isAuthenticated) {
      // No está autenticado, redirigir a login
      next({ name: 'login' })
    } else {
      // Está autenticado, permitir acceso
      next()
    }
  } 
  // Verificar si la ruta es solo para invitados
  else if (to.meta.requiresGuest) {
    if (authStore.isAuthenticated) {
      // Ya está autenticado, redirigir a peliculas
      next({ name: 'peliculas' })
    } else {
      next()
    }
  } 
  else {
    next()
  }
})

export default router

