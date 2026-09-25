import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../config/db";
import { ok } from "../utils/response";
import { ApiError } from "../middleware/error.middleware";
import { SentimentAvis, Prisma } from "@prisma/client";

export const getAvisQuerySchema = z.object({
  sentiment: z.enum(["POSITIF", "NEUTRE", "NEGATIF"], {
    errorMap: () => ({ message: "Le sentiment doit être 'POSITIF', 'NEUTRE' ou 'NEGATIF'" }),
  }).optional(),
  note: z.coerce.number().int().min(1).max(5).optional(),
  centreId: z.coerce.number().int().optional(),
  centre: z.coerce.number().int().optional(),
  coachId: z.coerce.number().int().optional(),
  seanceId: z.coerce.number().int().optional(),
  utilisateurId: z.coerce.number().int().optional(),
  client: z.coerce.number().int().optional(),
  search: z.string().trim().min(1).optional(),
  date: z.string().optional(),
  dateDebut: z.string().optional(),
  dateFin: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.enum(["dateCreation", "note", "sentiment"]).default("dateCreation"),
  sortOrder: z.enum(["asc", "desc"]).default("desc"),
});

export const createReviewSchema = z.object({
  note: z.number().int().min(1, "La note doit être au moins 1").max(5, "La note ne peut pas dépasser 5"),
  commentaire: z.string().min(5, "Le commentaire doit contenir au moins 5 caractères").optional(),
  coachId: z.number().int().optional(),
});

export const updateReviewSchema = z.object({
  note: z.number().int().min(1).max(5).optional(),
  commentaire: z.string().min(5).optional(),
});

// GET /api/avis ou /api/reviews (avec filtrage par sentiment, centre, client, note, date, search, pagination)
export async function getAllAvis(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = getAvisQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Paramètres de requête invalides",
        errors: parsed.error.flatten().fieldErrors,
      });
    }

    const { page, limit, sortBy, sortOrder, ...filters } = parsed.data;
    const skip = (page - 1) * limit;

    const where: Prisma.AvisWhereInput = {};

    if (filters.sentiment) {
      where.sentiment = filters.sentiment as SentimentAvis;
    }

    if (filters.note) {
      where.note = filters.note;
    }

    const targetCentreId = filters.centreId ?? filters.centre;
    if (targetCentreId) {
      where.seance = { centreId: targetCentreId };
    }

    if (filters.coachId) {
      where.coachId = filters.coachId;
    }

    if (filters.seanceId) {
      where.seanceId = filters.seanceId;
    }

    const targetUtilisateurId = filters.utilisateurId ?? filters.client;
    if (targetUtilisateurId) {
      where.utilisateurId = targetUtilisateurId;
    }

    if (filters.date) {
      const startOfDay = new Date(filters.date);
      if (!isNaN(startOfDay.getTime())) {
        startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(filters.date);
        endOfDay.setHours(23, 59, 59, 999);
        where.dateCreation = { gte: startOfDay, lte: endOfDay };
      }
    } else if (filters.dateDebut || filters.dateFin) {
      where.dateCreation = {};
      if (filters.dateDebut) {
        const dDebut = new Date(filters.dateDebut);
        if (!isNaN(dDebut.getTime())) where.dateCreation.gte = dDebut;
      }
      if (filters.dateFin) {
        const dFin = new Date(filters.dateFin);
        if (!isNaN(dFin.getTime())) where.dateCreation.lte = dFin;
      }
    }

    if (filters.search) {
      where.OR = [
        { commentaire: { contains: filters.search, mode: "insensitive" } },
        { utilisateur: { prenom: { contains: filters.search, mode: "insensitive" } } },
        { utilisateur: { nom: { contains: filters.search, mode: "insensitive" } } },
        { seance: { nom: { contains: filters.search, mode: "insensitive" } } },
      ];
    }

    const [total, avis] = await Promise.all([
      prisma.avis.count({ where }),
      prisma.avis.findMany({
        where,
        include: {
          utilisateur: { select: { id: true, prenom: true, nom: true, email: true } },
          coach: { select: { id: true, prenom: true, nom: true } },
          seance: {
            select: {
              id: true,
              nom: true,
              type: true,
              centre: { select: { id: true, nom: true, ville: true } },
            },
          },
        },
        orderBy: { [sortBy]: sortOrder },
        skip,
        take: limit,
      }),
    ]);

    return ok(res, {
      avis,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/avis/stats ou /api/reviews/stats (Statistiques de sentiment pour admin)
export async function getAvisStats(_req: Request, res: Response, next: NextFunction) {
  try {
    const [total, sentimentCounts] = await Promise.all([
      prisma.avis.count(),
      prisma.avis.groupBy({
        by: ["sentiment"],
        _count: { sentiment: true },
      }),
    ]);

    const stats = {
      total,
      positif: 0,
      neutre: 0,
      negatif: 0,
    };

    for (const item of sentimentCounts) {
      if (item.sentiment === SentimentAvis.POSITIF) stats.positif = item._count.sentiment;
      if (item.sentiment === SentimentAvis.NEUTRE) stats.neutre = item._count.sentiment;
      if (item.sentiment === SentimentAvis.NEGATIF) stats.negatif = item._count.sentiment;
    }

    return ok(res, stats);
  } catch (err) {
    next(err);
  }
}

// GET /api/seances/:seanceId/reviews
export async function getReviewsBySeance(req: Request, res: Response, next: NextFunction) {
  try {
    const seanceId = Number(req.params.seanceId);
    const avis = await prisma.avis.findMany({
      where: { seanceId },
      include: {
        utilisateur: { select: { prenom: true, nom: true } },
        coach: { select: { id: true, prenom: true, nom: true } },
      },
      orderBy: { dateCreation: "desc" },
    });
    return ok(res, avis);
  } catch (err) {
    next(err);
  }
}

// POST /api/seances/:seanceId/reviews  (membre connecté)
export async function createReview(req: Request, res: Response, next: NextFunction) {
  try {
    const seanceId = Number(req.params.seanceId);
    const utilisateurId = req.user!.id;
    const { note, commentaire, coachId } = req.body;

    const seance = await prisma.seanceEMS.findUnique({ where: { id: seanceId } });
    if (!seance) throw new ApiError(404, "Séance introuvable");

    const dejaNote = await prisma.avis.findUnique({
      where: { utilisateurId_seanceId: { utilisateurId, seanceId } },
    });
    if (dejaNote) throw new ApiError(409, "Vous avez déjà noté cette séance");

    const avis = await prisma.avis.create({
      data: { note, commentaire, coachId, seanceId, utilisateurId },
    });

    const agrege = await prisma.avis.aggregate({
      where: { seanceId },
      _avg: { note: true },
    });

    return ok(res, { avis, nouvelleMoyenne: agrege._avg.note }, 201);

    // TODO: déclencher ici la classification de sentiment (Ollama) en
    // arrière-plan, puis mettre à jour avis.sentiment.
  } catch (err) {
    next(err);
  }
}

// PUT /api/reviews/:id  (auteur uniquement)
export async function updateReview(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const utilisateurId = req.user!.id;

    const existant = await prisma.avis.findUnique({ where: { id } });
    if (!existant) throw new ApiError(404, "Avis introuvable");
    if (existant.utilisateurId !== utilisateurId) {
      throw new ApiError(403, "Vous ne pouvez modifier que vos propres avis");
    }

    const avis = await prisma.avis.update({ where: { id }, data: req.body });
    return ok(res, avis);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/reviews/:id  (auteur uniquement)
export async function deleteReview(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const utilisateurId = req.user!.id;

    const existant = await prisma.avis.findUnique({ where: { id } });
    if (!existant) throw new ApiError(404, "Avis introuvable");
    if (existant.utilisateurId !== utilisateurId) {
      throw new ApiError(403, "Vous ne pouvez supprimer que vos propres avis");
    }

    await prisma.avis.delete({ where: { id } });
    return ok(res, { deleted: true });
  } catch (err) {
    next(err);
  }
}

// GET /api/reviews/me  (mes avis)
export async function getMyReviews(req: Request, res: Response, next: NextFunction) {
  try {
    const utilisateurId = req.user!.id;
    const avis = await prisma.avis.findMany({
      where: { utilisateurId },
      include: { seance: true, coach: true },
      orderBy: { dateCreation: "desc" },
    });
    return ok(res, avis);
  } catch (err) {
    next(err);
  }
}