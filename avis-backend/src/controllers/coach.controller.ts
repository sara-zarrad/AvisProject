import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../config/db";
import { ok } from "../utils/response";
import { ApiError } from "../middleware/error.middleware";

export const createCoachSchema = z.object({
  prenom: z.string().min(1, "Le prénom est requis").max(100),
  nom: z.string().min(1, "Le nom est requis").max(100),
  centreId: z.number().int("L'identifiant du centre est requis"),
  specialite: z.string().min(1, "La spécialité est requise").max(150),
  experience: z.string().max(150).optional(),
  biographie: z.string().optional(),
  email: z.string().email("Format d'email invalide").optional(),
  telephone: z.string().max(30).optional(),
});

export const updateCoachSchema = z.object({
  prenom: z.string().min(1).max(100).optional(),
  nom: z.string().min(1).max(100).optional(),
  centreId: z.number().int().optional(),
  specialite: z.string().min(1).max(150).optional(),
  experience: z.string().max(150).optional(),
  biographie: z.string().optional(),
  email: z.string().email().optional(),
  telephone: z.string().max(30).optional(),
});

// GET /api/centres/:centreId/coachs (public)
export async function getCoachsByCentre(req: Request, res: Response, next: NextFunction) {
  try {
    const centreId = Number(req.params.centreId);
    const coachs = await prisma.coach.findMany({
      where: { centreId },
      include: {
        centre: { select: { id: true, nom: true, ville: true } },
        _count: { select: { avis: true, seances: true } },
      },
      orderBy: { nom: "asc" },
    });
    return ok(res, coachs);
  } catch (err) {
    next(err);
  }
}

// GET /api/coachs/:id (public, avec moyenne de notation sur ses avis)
export async function getCoachById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const coach = await prisma.coach.findUnique({
      where: { id },
      include: {
        centre: true,
        seances: {
          include: {
            seance: true,
          },
        },
        avis: {
          include: {
            utilisateur: { select: { id: true, prenom: true, nom: true } },
            seance: { select: { id: true, nom: true } },
          },
          orderBy: { dateCreation: "desc" },
        },
      },
    });

    if (!coach) throw new ApiError(404, "Coach introuvable");

    const totalNotes = coach.avis.length;
    const sommeNotes = coach.avis.reduce((acc, a) => acc + a.note, 0);
    const moyenne = totalNotes > 0 ? Number((sommeNotes / totalNotes).toFixed(1)) : null;

    return ok(res, {
      ...coach,
      totalAvis: totalNotes,
      moyenneNote: moyenne,
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/coachs (ADMINISTRATEUR uniquement)
export async function createCoach(req: Request, res: Response, next: NextFunction) {
  try {
    const { prenom, nom, centreId, specialite, experience, biographie, email, telephone } = req.body;

    const centre = await prisma.centreImotion.findUnique({ where: { id: centreId } });
    if (!centre) throw new ApiError(404, "Centre introuvable");

    const coach = await prisma.coach.create({
      data: { prenom, nom, centreId, specialite, experience, biographie, email, telephone },
    });

    return ok(res, coach, 201);
  } catch (err) {
    next(err);
  }
}

// PUT /api/coachs/:id (ADMINISTRATEUR uniquement)
export async function updateCoach(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const existant = await prisma.coach.findUnique({ where: { id } });
    if (!existant) throw new ApiError(404, "Coach introuvable");

    if (req.body.centreId) {
      const centre = await prisma.centreImotion.findUnique({ where: { id: req.body.centreId } });
      if (!centre) throw new ApiError(404, "Centre introuvable");
    }

    const coach = await prisma.coach.update({
      where: { id },
      data: req.body,
    });

    return ok(res, coach);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/coachs/:id (ADMINISTRATEUR uniquement)
export async function deleteCoach(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const existant = await prisma.coach.findUnique({ where: { id } });
    if (!existant) throw new ApiError(404, "Coach introuvable");

    await prisma.coach.delete({ where: { id } });
    return ok(res, { deleted: true });
  } catch (err) {
    next(err);
  }
}
