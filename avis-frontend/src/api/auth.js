import apiClient from './client';

/**
 * Service d'authentification pour i-motion Club
 * Connecté aux endpoints Express / Prisma :
 * - POST /api/auth/register (prenom, nom, email, motDePasse)
 * - POST /api/auth/login (email, motDePasse)
 * - GET /api/auth/me (Bearer token)
 */

export const authApi = {
  /**
   * Connexion utilisateur
   * @param {{ email: string, motDePasse: string }} credentials
   * @returns {Promise<{ token: string, user: { id: number, prenom: string, nom: string, email: string, role: string } }>}
   */
  login: async (credentials) => {
    try {
      const response = await apiClient.post('/api/auth/login', {
        email: credentials.email.trim(),
        motDePasse: credentials.motDePasse,
      });
      return response.data?.data || response.data;
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      if (error.code === 'ERR_NETWORK' || !error.response) {
        throw new Error("Impossible de joindre le backend Express. Vérifiez que le serveur backend tourne bien sur le port configuré dans le fichier .env (VITE_API_URL).");
      }
      throw error;
    }
  },

  /**
   * Inscription d'un nouveau membre (enregistre directement dans PostgreSQL via Prisma)
   * @param {{ prenom: string, nom: string, email: string, motDePasse: string }} userData
   * @returns {Promise<{ token: string, user: { id: number, prenom: string, nom: string, email: string, role: string } }>}
   */
  register: async (userData) => {
    try {
      const response = await apiClient.post('/api/auth/register', {
        prenom: userData.prenom.trim(),
        nom: userData.nom.trim(),
        email: userData.email.trim(),
        motDePasse: userData.motDePasse,
      });
      return response.data?.data || response.data;
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      if (error.code === 'ERR_NETWORK' || !error.response) {
        throw new Error("Impossible de joindre le backend Express. Vérifiez que le serveur backend tourne bien sur le port configuré dans le fichier .env (VITE_API_URL).");
      }
      throw error;
    }
  },

  /**
   * Récupération du profil de l'utilisateur connecté
   * @returns {Promise<Object>}
   */
  getCurrentUser: async () => {
    try {
      const response = await apiClient.get('/api/auth/me');
      return response.data?.data || response.data;
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      if (error.code === 'ERR_NETWORK' || !error.response) {
        throw new Error("Impossible de joindre le backend.");
      }
      throw error;
    }
  },
};

export default authApi;


