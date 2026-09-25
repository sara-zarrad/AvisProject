import apiClient from './client';
import centresApi from './centres';
import seancesApi from './seances';
import coachesApi from './coaches';
import avisApi from './avis';

/**
 * Service API pour le tableau de bord administrateur
 */
export const dashboardApi = {
  /**
   * Récupérer les statistiques globales et analytiques pour l'administrateur
   * GET /api/admin/dashboard (avec calcul dynamique à partir de la base de données réelle)
   * @returns {Promise<Object>}
   */
  getDashboardStats: async () => {
    try {
      try {
        const response = await apiClient.get('/api/admin/dashboard');
        const resData = response.data?.data || response.data;
        if (resData && typeof resData === 'object' && resData.totalCentres !== undefined) {
          return resData;
        }
      } catch (errApi) {
        // En cas de 404 sur Express, calculer dynamiquement à partir des données réelles
      }

      // Chargement des entités réelles depuis le backend Express / Prisma
      const [centres, seances, coaches, avis] = await Promise.all([
        centresApi.getCentres().catch(() => []),
        seancesApi.getSeances().catch(() => []),
        coachesApi.getCoaches().catch(() => []),
        avisApi.getAllAvis().catch(() => []),
      ]);

      const totalCentres = centres.length;
      const totalSeances = seances.length;
      const totalCoaches = coaches.length;
      const totalAvis = avis.length;
      const totalMembres = Math.max(1, new Set(avis.map((a) => a.utilisateurId || a.utilisateurNom)).size);

      // Calcul des moyennes
      const totalSeanceNotesSum = avis.reduce((acc, a) => acc + (Number(a.note) || 0), 0);
      const moyenneGlobaleSeances = totalAvis > 0 ? Number((totalSeanceNotesSum / totalAvis).toFixed(2)) : 0;

      const totalCoachNotesSum = avis.reduce(
        (acc, a) => acc + (a.noteCoach !== undefined ? Number(a.noteCoach) : (Number(a.note) || 0)),
        0
      );
      const moyenneGlobaleCoaches = totalAvis > 0 ? Number((totalCoachNotesSum / totalAvis).toFixed(2)) : 0;

      const moyenneGlobale = Number(((moyenneGlobaleSeances + moyenneGlobaleCoaches) / 2).toFixed(2));

      // Répartition des notes séances (1 à 5)
      const repartitionNotes = {
        5: avis.filter((a) => Number(a.note) === 5).length,
        4: avis.filter((a) => Number(a.note) === 4).length,
        3: avis.filter((a) => Number(a.note) === 3).length,
        2: avis.filter((a) => Number(a.note) === 2).length,
        1: avis.filter((a) => Number(a.note) === 1).length,
      };

      // Répartition des notes coachs (1 à 5)
      const repartitionNotesCoach = {
        5: avis.filter((a) => Number(a.noteCoach !== undefined ? a.noteCoach : a.note) === 5).length,
        4: avis.filter((a) => Number(a.noteCoach !== undefined ? a.noteCoach : a.note) === 4).length,
        3: avis.filter((a) => Number(a.noteCoach !== undefined ? a.noteCoach : a.note) === 3).length,
        2: avis.filter((a) => Number(a.noteCoach !== undefined ? a.noteCoach : a.note) === 2).length,
        1: avis.filter((a) => Number(a.noteCoach !== undefined ? a.noteCoach : a.note) === 1).length,
      };

      // Top coachs
      const coachesWithStats = coaches.map((c) => {
        const coachAvis = avis.filter((a) => String(a.coachId) === String(c.id));
        const avisCount = coachAvis.length;
        let moy = 0;
        if (avisCount > 0) {
          const sum = coachAvis.reduce(
            (acc, curr) => acc + (curr.noteCoach !== undefined ? Number(curr.noteCoach) : Number(curr.note)),
            0
          );
          moy = Number((sum / avisCount).toFixed(1));
        }
        return {
          ...c,
          nombreAvis: avisCount,
          moyenneNote: moy || c.moyenneNote || 0,
        };
      });

      const topCoaches = [...coachesWithStats]
        .sort((a, b) => b.moyenneNote - a.moyenneNote || b.nombreAvis - a.nombreAvis)
        .slice(0, 4);

      // Top séances
      const seancesWithStats = seances.map((s) => {
        const seanceAvis = avis.filter((a) => String(a.seanceId) === String(s.id));
        const avisCount = seanceAvis.length;
        let moy = 0;
        if (avisCount > 0) {
          const sum = seanceAvis.reduce((acc, curr) => acc + Number(curr.note), 0);
          moy = Number((sum / avisCount).toFixed(1));
        }
        return {
          ...s,
          nombreAvis: avisCount,
          moyenneNote: moy || s.moyenneNote || 0,
        };
      });

      const topSeances = [...seancesWithStats]
        .sort((a, b) => b.moyenneNote - a.moyenneNote || b.nombreAvis - a.nombreAvis)
        .slice(0, 4);

      return {
        totalCentres,
        totalSeances,
        totalCoaches,
        totalMembres,
        totalAvis,
        moyenneGlobale,
        moyenneGlobaleSeances,
        moyenneGlobaleCoaches,
        repartitionNotes,
        repartitionNotesCoach,
        topCoaches,
        topSeances,
        derniersAvis: avis.slice(0, 8),
      };
    } catch (error) {
      console.error('Erreur getDashboardStats:', error);
      return {
        totalCentres: 0,
        totalSeances: 0,
        totalCoaches: 0,
        totalMembres: 0,
        totalAvis: 0,
        moyenneGlobale: 0,
        moyenneGlobaleSeances: 0,
        moyenneGlobaleCoaches: 0,
        repartitionNotes: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        repartitionNotesCoach: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
        topCoaches: [],
        topSeances: [],
        derniersAvis: [],
      };
    }
  },
};

export default dashboardApi;
