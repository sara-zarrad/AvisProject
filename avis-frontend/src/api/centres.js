import apiClient from './client';

/**
 * Service API pour la gestion des centres i-motion Club EMS en Tunisie
 * Connecté aux endpoints Express / Prisma :
 * - GET /api/centres
 * - GET /api/centres/:id
 * - GET /api/centres/:centreId/seances
 * - GET /api/centres/:centreId/coachs
 * - POST /api/centres (ADMIN)
 * - PUT /api/centres/:id (ADMIN)
 * - DELETE /api/centres/:id (ADMIN)
 */
export const centresApi = {
  /**
   * Récupérer tous les centres
   * @returns {Promise<Array>}
   */
  getCentres: async () => {
    try {
      const response = await apiClient.get('/api/centres');
      return response.data?.data || response.data;
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  },

  /**
   * Récupérer un centre par son ID (avec séances et coachs inclus)
   * @param {number|string} id
   * @returns {Promise<Object>}
   */
  getCentreById: async (id) => {
    try {
      const response = await apiClient.get(`/api/centres/${id}`);
      return response.data?.data || response.data;
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  },

  /**
   * Récupérer les séances d'un centre
   * @param {number|string} centreId
   * @returns {Promise<Array>}
   */
  getSeancesByCentre: async (centreId) => {
    try {
      const response = await apiClient.get(`/api/centres/${centreId}/seances`);
      return response.data?.data || response.data;
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  },

  /**
   * Récupérer les coachs d'un centre
   * @param {number|string} centreId
   * @returns {Promise<Array>}
   */
  getCoachsByCentre: async (centreId) => {
    try {
      const response = await apiClient.get(`/api/centres/${centreId}/coachs`);
      return response.data?.data || response.data;
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw error;
    }
  },

  /**
   * Créer un nouveau centre (Admin)
   * @param {{ nom: string, ville: string, numTel: string, adresse: string, description?: string }} data
   * @returns {Promise<Object>}
   */
  createCentre: async (data) => {
    try {
      const response = await apiClient.post('/api/centres', {
        nom: data.nom.trim(),
        ville: data.ville.trim(),
        numTel: data.numTel.trim(),
        adresse: data.adresse.trim(),
        description: data.description ? data.description.trim() : undefined,
      });
      return response.data?.data || response.data;
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw error;
    }
  },

  /**
   * Mettre à jour un centre (Admin)
   * @param {number|string} id
   * @param {{ nom?: string, ville?: string, numTel?: string, adresse?: string, description?: string }} data
   * @returns {Promise<Object>}
   */
  updateCentre: async (id, data) => {
    try {
      const payload = {};
      if (data.nom !== undefined) payload.nom = data.nom.trim();
      if (data.ville !== undefined) payload.ville = data.ville.trim();
      if (data.numTel !== undefined) payload.numTel = data.numTel.trim();
      if (data.adresse !== undefined) payload.adresse = data.adresse.trim();
      if (data.description !== undefined) payload.description = data.description.trim();

      const response = await apiClient.put(`/api/centres/${id}`, payload);
      return response.data?.data || response.data;
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw error;
    }
  },

  /**
   * Supprimer un centre (Admin)
   * @param {number|string} id
   * @returns {Promise<void>}
   */
  deleteCentre: async (id) => {
    try {
      const response = await apiClient.delete(`/api/centres/${id}`);
      return response.data?.data || response.data;
    } catch (error) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      throw error;
    }
  },
};

export default centresApi;

