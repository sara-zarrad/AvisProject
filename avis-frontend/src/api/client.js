import axios from 'axios';

// URL de base de l'API backend Express / PostgreSQL (utilise le proxy Vite /api par défaut ou VITE_API_URL si spécifié)
export const API_BASE_URL = import.meta.env.VITE_API_URL || '';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Intercepteur pour ajouter le token JWT à chaque requête sortante
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('imotion_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Intercepteur pour gérer les erreurs et notamment la 401 Unauthorized
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Déconnexion de l'utilisateur : nettoyage du stockage
      localStorage.removeItem('imotion_token');
      localStorage.removeItem('imotion_user');
      
      // Dispatch d'un événement global pour avertir le contexte
      window.dispatchEvent(new CustomEvent('imotion:unauthorized'));

      // Ne rediriger vers /login QUE si on se trouve sur une route privée protégée
      const currentPath = window.location.pathname;
      const isPublicPath = 
        currentPath === '/' || 
        currentPath === '/centres' || 
        currentPath.startsWith('/centres/') || 
        currentPath.startsWith('/seances/') || 
        currentPath === '/login' || 
        currentPath === '/register';

      if (!isPublicPath) {
        const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
        window.location.href = `/login?redirect=${returnUrl}`;
      }
    }
    return Promise.reject(error);
  }
);

export default apiClient;
