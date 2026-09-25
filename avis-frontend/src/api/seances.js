import apiClient from './client';

/**
 * Helper pour formater une séance reçue du backend Prisma
 * Gère l'extraction des coachs inclus (relation SeanceCoach: coachs -> coach)
 */
const formatSeance = (seance) => {
  if (!seance) return null;

  const coaches = Array.isArray(seance.coachs)
    ? seance.coachs.map((sc) => sc.coach || sc).filter(Boolean)
    : Array.isArray(seance.coaches)
    ? seance.coaches
    : [];

  const coachIds = coaches.map((c) => c.id);

  return {
    ...seance,
    centreNom: seance.centre?.nom || seance.centreNom || 'Centre i-motion',
    centreVille: seance.centre?.ville || seance.centreVille || 'Tunisie',
    coaches,
    coachIds,
  };
};

/**
 * Service API pour la gestion des séances d'électrostimulation (EMS)
 * Connecté aux endpoints Express / Prisma :
 * - GET /api/seances/:id
 * - GET /api/centres/:centreId/seances
 * - POST /api/seances (ADMIN)
 * - PUT /api/seances/:id (ADMIN)
 * - DELETE /api/seances/:id (ADMIN)
 */
export const seancesApi = {
  /**
   * Récupérer toutes les séances (tous centres confondus)
   * @returns {Promise<Array>}
   */
  getSeances: async () => {
    try {
      // Tenter l'appel direct /api/seances si la route existe
      const response = await apiClient.get('/api/seances');
      const data = response.data?.data || response.data;
      return Array.isArray(data) ? data.map(formatSeance) : [];
    } catch (error) {
      // Si /api/seances n'existe pas, agréger via la liste des centres
      if (error.response && error.response.status === 404) {
        try {
          const centresRes = await apiClient.get('/api/centres');
          const centres = centresRes.data?.data || centresRes.data || [];
          const allSeancesArrays = await Promise.all(
            centres.map(async (c) => {
              try {
                const sRes = await apiClient.get(`/api/centres/${c.id}/seances`);
                const list = sRes.data?.data || sRes.data || [];
                return list.map((s) => ({
                  ...s,
                  centreNom: c.nom,
                  centreVille: c.ville,
                }));
              } catch {
                return [];
              }
            })
          );
          return allSeancesArrays.flat().map(formatSeance);
        } catch {
          return [];
        }
      }
      if (error.response?.data?.message) throw new Error(error.response.data.message);
      throw error;
    }
  },

  /**
   * Récupérer les séances d'un centre donné
   * GET /api/centres/:centreId/seances
   * @param {number|string} centreId
   * @returns {Promise<Array>}
   */
  getSeancesByCentre: async (centreId) => {
    try {
      const response = await apiClient.get(`/api/centres/${centreId}/seances`);
      const data = response.data?.data || response.data;
      return Array.isArray(data) ? data.map(formatSeance) : [];
    } catch (error) {
      if (error.response?.data?.message) throw new Error(error.response.data.message);
      throw error;
    }
  },

  /**
   * Récupérer le détail complet d'une séance par son ID (avec centre, coachs et avis)
   * GET /api/seances/:id
   * @param {number|string} id
   * @returns {Promise<Object>}
   */
  getSeanceById: async (id) => {
    try {
      const response = await apiClient.get(`/api/seances/${id}`);
      const data = response.data?.data || response.data;
      return formatSeance(data);
    } catch (error) {
      if (error.response?.data?.message) throw new Error(error.response.data.message);
      throw error;
    }
  },

  /**
   * Créer une nouvelle séance EMS (ADMINISTRATEUR uniquement)
   * POST /api/seances
   * @param {{ nom: string, type: string, description?: string, centreId: number|string, coachIds?: number[] }} data
   * @returns {Promise<Object>}
   */
  createSeance: async (data) => {
    try {
      const payload = {
        nom: data.nom.trim(),
        type: data.type.trim(),
        description: data.description ? data.description.trim() : undefined,
        centreId: Number(data.centreId),
        coachIds: Array.isArray(data.coachIds) ? data.coachIds.map(Number) : [],
      };

      const response = await apiClient.post('/api/seances', payload);
      const resData = response.data?.data || response.data;
      return formatSeance(resData);
    } catch (error) {
      if (error.response?.data?.message) throw new Error(error.response.data.message);
      if (error.response?.data?.error) throw new Error(error.response.data.error);
      throw error;
    }
  },

  /**
   * Mettre à jour une séance (ADMINISTRATEUR uniquement)
   * PUT /api/seances/:id
   * @param {number|string} id
   * @param {{ nom?: string, type?: string, description?: string, centreId?: number|string, coachIds?: number[] }} data
   * @returns {Promise<Object>}
   */
  updateSeance: async (id, data) => {
    try {
      const payload = {};
      if (data.nom !== undefined) payload.nom = data.nom.trim();
      if (data.type !== undefined) payload.type = data.type.trim();
      if (data.description !== undefined) payload.description = data.description.trim();
      if (data.centreId !== undefined) payload.centreId = Number(data.centreId);
      if (data.coachIds !== undefined) {
        payload.coachIds = Array.isArray(data.coachIds) ? data.coachIds.map(Number) : [];
      }

      const response = await apiClient.put(`/api/seances/${id}`, payload);
      const resData = response.data?.data || response.data;
      return formatSeance(resData);
    } catch (error) {
      if (error.response?.data?.message) throw new Error(error.response.data.message);
      if (error.response?.data?.error) throw new Error(error.response.data.error);
      throw error;
    }
  },

  /**
   * Supprimer une séance (ADMINISTRATEUR uniquement)
   * DELETE /api/seances/:id
   * @param {number|string} id
   * @returns {Promise<void>}
   */
  deleteSeance: async (id) => {
    try {
      const response = await apiClient.delete(`/api/seances/${id}`);
      return response.data?.data || response.data;
    } catch (error) {
      if (error.response?.data?.message) throw new Error(error.response.data.message);
      if (error.response?.data?.error) throw new Error(error.response.data.error);
      throw error;
    }
  },
};

export default seancesApi;

