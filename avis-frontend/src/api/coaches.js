import apiClient from './client';

/**
 * Normaliser un coach reçu du backend
 */
const formatCoach = (coach) => {
  if (!coach) return null;
  return {
    ...coach,
    bio: coach.biographie || coach.bio || '',
    centreNom: coach.centre?.nom || coach.centreNom || 'Centre i-motion',
    centreVille: coach.centre?.ville || coach.centreVille || 'Tunisie',
  };
};

/**
 * Service API pour la gestion des coaches EMS certifiés i-motion
 * Connecté aux endpoints Express / Prisma :
 * - GET /api/coachs/:id
 * - GET /api/centres/:centreId/coachs
 * - POST /api/coachs (ADMIN)
 * - PUT /api/coachs/:id (ADMIN)
 * - DELETE /api/coachs/:id (ADMIN)
 */
export const coachesApi = {
  /**
   * Récupérer tous les coaches (tous centres confondus)
   * @returns {Promise<Array>}
   */
  getCoaches: async () => {
    try {
      // 1. Tenter un GET /api/coachs direct si la route globale existe
      try {
        const response = await apiClient.get('/api/coachs');
        const data = response.data?.data || response.data;
        if (Array.isArray(data)) return data.map(formatCoach);
      } catch (err) {
        if (err.response?.status !== 404) throw err;
      }

      // 2. Si 404, agréger les coachs de tous les centres via /api/centres/:id/coachs
      const centresRes = await apiClient.get('/api/centres');
      const centres = centresRes.data?.data || centresRes.data || [];
      const allCoachArrays = await Promise.all(
        centres.map(async (centre) => {
          try {
            const res = await apiClient.get(`/api/centres/${centre.id}/coachs`);
            const list = res.data?.data || res.data || [];
            return list.map((c) => ({
              ...c,
              centreId: centre.id,
              centreNom: centre.nom,
              centreVille: centre.ville,
            }));
          } catch {
            return [];
          }
        })
      );

      return allCoachArrays.flat().map(formatCoach);
    } catch (error) {
      if (error.response?.data?.message) throw new Error(error.response.data.message);
      return [];
    }
  },

  /**
   * Récupérer un coach par son identifiant
   * GET /api/coachs/:id
   * @param {number|string} id
   * @returns {Promise<Object>}
   */
  getCoachById: async (id) => {
    try {
      const response = await apiClient.get(`/api/coachs/${id}`);
      const data = response.data?.data || response.data;
      return formatCoach(data);
    } catch (error) {
      if (error.response?.data?.message) throw new Error(error.response.data.message);
      throw error;
    }
  },

  /**
   * Récupérer les coaches d'un centre donné
   * GET /api/centres/:centreId/coachs
   * @param {number|string} centreId
   * @returns {Promise<Array>}
   */
  getCoachesByCentre: async (centreId) => {
    try {
      const response = await apiClient.get(`/api/centres/${centreId}/coachs`);
      const data = response.data?.data || response.data;
      return Array.isArray(data) ? data.map(formatCoach) : [];
    } catch (error) {
      if (error.response?.data?.message) throw new Error(error.response.data.message);
      return [];
    }
  },

  /**
   * Récupérer les coaches assignés à une séance
   * @param {number|string} seanceId
   * @returns {Promise<Array>}
   */
  getCoachesBySeance: async (seanceId) => {
    try {
      const response = await apiClient.get(`/api/seances/${seanceId}`);
      const seance = response.data?.data || response.data;
      if (seance?.coachs && Array.isArray(seance.coachs)) {
        return seance.coachs.map((sc) => sc.coach || sc).filter(Boolean).map(formatCoach);
      }
      return [];
    } catch {
      return [];
    }
  },

  /**
   * Créer un nouveau coach EMS (ADMINISTRATEUR uniquement)
   * POST /api/coachs
   * @param {{ nom: string, prenom: string, centreId: number|string, specialite: string, experience?: string, biographie?: string, bio?: string, email?: string, telephone?: string }} data
   * @returns {Promise<Object>}
   */
  createCoach: async (data) => {
    try {
      const bioValue = data.biographie || data.bio;
      const payload = {
        nom: data.nom.trim(),
        prenom: data.prenom.trim(),
        centreId: Number(data.centreId),
        specialite: data.specialite ? data.specialite.trim() : 'Coach EMS Certifié',
        experience: data.experience ? data.experience.trim() : undefined,
        biographie: bioValue && bioValue.trim() ? bioValue.trim() : undefined,
        email: data.email && data.email.trim() ? data.email.trim() : undefined,
        telephone: data.telephone && data.telephone.trim() ? data.telephone.trim() : undefined,
      };

      const response = await apiClient.post('/api/coachs', payload);
      const resData = response.data?.data || response.data;
      return formatCoach(resData);
    } catch (error) {
      if (error.response?.data?.message) throw new Error(error.response.data.message);
      if (error.response?.data?.error) throw new Error(error.response.data.error);
      throw error;
    }
  },

  /**
   * Mettre à jour un coach (ADMINISTRATEUR uniquement)
   * PUT /api/coachs/:id
   * @param {number|string} id
   * @param {Object} data
   * @returns {Promise<Object>}
   */
  updateCoach: async (id, data) => {
    try {
      const payload = {};
      if (data.nom !== undefined) payload.nom = data.nom.trim();
      if (data.prenom !== undefined) payload.prenom = data.prenom.trim();
      if (data.centreId !== undefined) payload.centreId = Number(data.centreId);
      if (data.specialite !== undefined) payload.specialite = data.specialite.trim();
      if (data.experience !== undefined) payload.experience = data.experience.trim();
      if (data.biographie !== undefined || data.bio !== undefined) {
        const bioVal = data.biographie !== undefined ? data.biographie : data.bio;
        payload.biographie = bioVal ? bioVal.trim() : undefined;
      }
      if (data.email !== undefined) payload.email = data.email.trim() || undefined;
      if (data.telephone !== undefined) payload.telephone = data.telephone.trim() || undefined;

      const response = await apiClient.put(`/api/coachs/${id}`, payload);
      const resData = response.data?.data || response.data;
      return formatCoach(resData);
    } catch (error) {
      if (error.response?.data?.message) throw new Error(error.response.data.message);
      if (error.response?.data?.error) throw new Error(error.response.data.error);
      throw error;
    }
  },

  /**
   * Supprimer un coach (ADMINISTRATEUR uniquement)
   * DELETE /api/coachs/:id
   * @param {number|string} id
   * @returns {Promise<void>}
   */
  deleteCoach: async (id) => {
    try {
      const response = await apiClient.delete(`/api/coachs/${id}`);
      return response.data?.data || response.data;
    } catch (error) {
      if (error.response?.data?.message) throw new Error(error.response.data.message);
      if (error.response?.data?.error) throw new Error(error.response.data.error);
      throw error;
    }
  },
};

export default coachesApi;


