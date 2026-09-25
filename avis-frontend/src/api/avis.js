import apiClient from './client';
import seancesApi from './seances';

/**
 * Normaliser un avis reçu du backend Prisma
 */
const formatAvis = (a) => {
  if (!a) return null;
  const userNom = a.utilisateur ? `${a.utilisateur.prenom} ${a.utilisateur.nom}` : a.utilisateurNom || 'Membre i-motion';
  const coachNom = a.coach ? `${a.coach.prenom} ${a.coach.nom}` : a.coachNom || null;
  const seanceNom = a.seance ? a.seance.nom : a.seanceNom || (a.seanceId ? `Séance #${a.seanceId}` : '');
  const centreNom = a.seance?.centre ? a.seance.centre.nom : a.centreNom || 'Centre i-motion';

  return {
    ...a,
    note: Number(a.note),
    noteCoach: a.noteCoach !== undefined ? Number(a.noteCoach) : Number(a.note),
    sentiment: a.sentiment || null,
    utilisateurNom: userNom,
    coachNom: coachNom,
    coachSpecialite: a.coach?.specialite || a.coachSpecialite || null,
    coachAvatar: a.coach?.avatar || (coachNom ? coachNom.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : null),
    seanceNom: seanceNom,
    centreNom: centreNom,
  };
};

/**
 * Service API pour la gestion et le dépôt des avis (reviews)
 * Connecté aux endpoints Express / Prisma :
 * - GET /api/seances/:seanceId/reviews
 * - POST /api/seances/:seanceId/reviews (Membre connecté)
 * - GET /api/reviews/me (Mes avis)
 * - PUT /api/reviews/:id (Auteur)
 * - DELETE /api/reviews/:id (Auteur)
 */
export const avisApi = {
  /**
   * Récupérer tous les avis réels de la plateforme (pour l'administration)
   * Interroge /api/reviews ou agrège depuis toutes les séances de la base de données PostgreSQL
   * @returns {Promise<Array>}
   */
  getAllAvis: async () => {
    try {
      // 1. Tenter l'endpoint global direct s'il existe
      try {
        const response = await apiClient.get('/api/reviews');
        const data = response.data?.data || response.data;
        if (Array.isArray(data)) return data.map(formatAvis);
      } catch (e1) {
        try {
          const response = await apiClient.get('/api/admin/reviews');
          const data = response.data?.data || response.data;
          if (Array.isArray(data)) return data.map(formatAvis);
        } catch (e2) {
          // Continuer vers l'agrégation par séance
        }
      }

      // 2. Récupérer toutes les séances depuis la base de données réelle
      // et charger les avis réels de chaque séance via GET /api/seances/:id/reviews
      try {
        const seances = await seancesApi.getSeances();
        if (Array.isArray(seances) && seances.length > 0) {
          const allReviewsArrays = await Promise.all(
            seances.map(async (seance) => {
              try {
                const res = await apiClient.get(`/api/seances/${seance.id}/reviews`);
                const list = res.data?.data || res.data || [];
                return Array.isArray(list)
                  ? list.map((a) => ({
                      ...a,
                      seanceId: seance.id,
                      seanceNom: seance.nom,
                      centreNom: seance.centreNom,
                    }))
                  : [];
              } catch {
                return [];
              }
            })
          );
          const combined = allReviewsArrays.flat();
          return combined.map(formatAvis);
        }
      } catch (errSeances) {
        console.warn('Erreur lors du chargement des avis par séance:', errSeances);
      }

      // Si aucun avis dans la base de données, retourner la liste vide réelle
      return [];
    } catch (error) {
      console.error('Erreur getAllAvis:', error);
      return [];
    }
  },

  /**
   * Récupérer tous les avis d'une séance
   * GET /api/seances/:seanceId/reviews
   * @param {number|string} seanceId
   * @returns {Promise<Array>}
   */
  getAvisBySeance: async (seanceId) => {
    try {
      try {
        const response = await apiClient.get(`/api/seances/${seanceId}/reviews`);
        const data = response.data?.data || response.data;
        return Array.isArray(data) ? data.map(formatAvis) : [];
      } catch (err) {
        if (err.response?.status === 404) {
          const response = await apiClient.get(`/api/seances/${seanceId}/avis`);
          const data = response.data?.data || response.data;
          return Array.isArray(data) ? data.map(formatAvis) : [];
        }
        throw err;
      }
    } catch (error) {
      if (error.response?.data?.message) throw new Error(error.response.data.message);
      return [];
    }
  },

  /**
   * Déposer un avis sur une séance et choisir le coach ayant entraîné le membre
   * POST /api/seances/:seanceId/reviews
   * @param {number|string} seanceId
   * @param {{ note: number, commentaire?: string, coachId?: number|string }} data
   * @returns {Promise<{ avis: Object, nouvelleMoyenne: number }>}
   */
  createAvis: async (seanceId, data) => {
    try {
      const payload = {
        note: Number(data.note),
        commentaire: data.commentaire ? data.commentaire.trim() : undefined,
        coachId: data.coachId ? Number(data.coachId) : undefined,
      };

      let response;
      try {
        response = await apiClient.post(`/api/seances/${seanceId}/reviews`, payload);
      } catch (err) {
        if (err.response?.status === 404) {
          response = await apiClient.post(`/api/seances/${seanceId}/avis`, payload);
        } else {
          throw err;
        }
      }

      const resData = response.data?.data || response.data;
      return {
        avis: formatAvis(resData.avis || resData),
        nouvelleMoyenne: resData.nouvelleMoyenne !== undefined ? resData.nouvelleMoyenne : undefined,
      };
    } catch (error) {
      if (error.response?.data?.message) throw new Error(error.response.data.message);
      if (error.response?.data?.error) throw new Error(error.response.data.error);
      throw error;
    }
  },

  /**
   * Récupérer tous les avis rédigés par le membre connecté
   * GET /api/reviews/me
   * @returns {Promise<Array>}
   */
  getMyAvis: async () => {
    try {
      try {
        const response = await apiClient.get('/api/reviews/me');
        const data = response.data?.data || response.data;
        return Array.isArray(data) ? data.map(formatAvis) : [];
      } catch (err) {
        if (err.response?.status === 404) {
          const response = await apiClient.get('/api/avis/me');
          const data = response.data?.data || response.data;
          return Array.isArray(data) ? data.map(formatAvis) : [];
        }
        throw err;
      }
    } catch (error) {
      if (error.response?.data?.message) throw new Error(error.response.data.message);
      return [];
    }
  },

  /**
   * Modifier un avis existant
   * PUT /api/reviews/:id
   * @param {number|string} id
   * @param {{ note?: number, commentaire?: string }} data
   * @returns {Promise<Object>}
   */
  updateAvis: async (id, data) => {
    try {
      const payload = {};
      if (data.note !== undefined) payload.note = Number(data.note);
      if (data.commentaire !== undefined) payload.commentaire = data.commentaire.trim();

      let response;
      try {
        response = await apiClient.put(`/api/reviews/${id}`, payload);
      } catch (err) {
        if (err.response?.status === 404) {
          response = await apiClient.put(`/api/avis/${id}`, payload);
        } else {
          throw err;
        }
      }

      const resData = response.data?.data || response.data;
      return formatAvis(resData);
    } catch (error) {
      if (error.response?.data?.message) throw new Error(error.response.data.message);
      if (error.response?.data?.error) throw new Error(error.response.data.error);
      throw error;
    }
  },

  /**
   * Supprimer un avis
   * DELETE /api/reviews/:id
   * @param {number|string} id
   * @returns {Promise<void>}
   */
  deleteAvis: async (id) => {
    try {
      try {
        await apiClient.delete(`/api/reviews/${id}`);
      } catch (err) {
        if (err.response?.status === 404) {
          await apiClient.delete(`/api/avis/${id}`);
        } else {
          throw err;
        }
      }
    } catch (error) {
      if (error.response?.data?.message) throw new Error(error.response.data.message);
      if (error.response?.data?.error) throw new Error(error.response.data.error);
      throw error;
    }
  },
};

export default avisApi;
