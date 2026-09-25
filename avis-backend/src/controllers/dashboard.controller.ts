import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/db";
import { ok } from "../utils/response";
import { RoleUtilisateur, SentimentAvis } from "@prisma/client";

// GET /api/admin/dashboard (ADMINISTRATEUR uniquement)
export async function getAdminDashboard(_req: Request, res: Response, next: NextFunction) {
  try {
    const [
      totalCentres,
      totalSeances,
      totalCoachs,
      totalMembres,
      totalAvis,
      moyenneAgg,
      repartitionGroup,
      sentimentGroup,
      seancesWithAvis,
    ] = await Promise.all([
      prisma.centreImotion.count(),
      prisma.seanceEMS.count(),
      prisma.coach.count(),
      prisma.utilisateur.count({ where: { role: RoleUtilisateur.MEMBRE } }),
      prisma.avis.count(),
      prisma.avis.aggregate({ _avg: { note: true } }),
      prisma.avis.groupBy({
        by: ["note"],
        _count: { note: true },
      }),
      prisma.avis.groupBy({
        by: ["sentiment"],
        _count: { sentiment: true },
      }),
      prisma.seanceEMS.findMany({
        include: {
          centre: { select: { nom: true, ville: true } },
          avis: { select: { note: true } },
        },
      }),
    ]);

    // Répartition des notes 1 à 5
    const repartitionNotes: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    for (const item of repartitionGroup) {
      repartitionNotes[item.note] = item._count.note;
    }

    // Répartition des sentiments (POSITIF, NEUTRE, NEGATIF)
    const repartitionSentiments = {
      total: totalAvis,
      positif: 0,
      neutre: 0,
      negatif: 0,
    };
    for (const item of sentimentGroup) {
      if (item.sentiment === SentimentAvis.POSITIF) repartitionSentiments.positif = item._count.sentiment;
      if (item.sentiment === SentimentAvis.NEUTRE) repartitionSentiments.neutre = item._count.sentiment;
      if (item.sentiment === SentimentAvis.NEGATIF) repartitionSentiments.negatif = item._count.sentiment;
    }

    // Calcul des moyennes par séance
    const seancesAvecMoyenne = seancesWithAvis
      .filter((s) => s.avis.length > 0)
      .map((s) => {
        const somme = s.avis.reduce((acc, a) => acc + a.note, 0);
        const moyenne = Number((somme / s.avis.length).toFixed(1));
        return {
          id: s.id,
          nom: s.nom,
          type: s.type,
          centre: `${s.centre.nom} (${s.centre.ville})`,
          totalAvis: s.avis.length,
          moyenneNote: moyenne,
        };
      });

    // Classement : Meilleures et moins bien notées
    const meilleuresSeances = [...seancesAvecMoyenne]
      .sort((a, b) => b.moyenneNote - a.moyenneNote)
      .slice(0, 5);

    const moinsBienNotees = [...seancesAvecMoyenne]
      .sort((a, b) => a.moyenneNote - b.moyenneNote)
      .slice(0, 5);

    return ok(res, {
      statistiques: {
        totalCentres,
        totalSeances,
        totalCoachs,
        totalMembres,
        totalAvis,
        moyenneGlobale: moyenneAgg._avg.note ? Number(moyenneAgg._avg.note.toFixed(1)) : 0,
      },
      repartitionNotes,
      repartitionSentiments,
      meilleuresSeances,
      moinsBienNotees,
    });
  } catch (err) {
    next(err);
  }
}
