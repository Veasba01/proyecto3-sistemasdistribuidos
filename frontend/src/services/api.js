import axios from 'axios';

// Configuración base de Axios
const apiClient = axios.create({
  baseURL: '/.netlify/functions',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000, // 30 segundos de timeout para cold starts
});

// Interceptor para requests
apiClient.interceptors.request.use(
  (config) => {
    console.log(`${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    console.error('Error en request:', error);
    return Promise.reject(error);
  }
);

// Interceptor para responses
apiClient.interceptors.response.use(
  (response) => {
    console.log(`Response ${response.status} from ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error('Error en response:', error.response?.data || error.message);
    return Promise.reject(error);
  }
);

export default apiClient;
