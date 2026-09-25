import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../config/db";
import { ok } from "../utils/response";
import { ApiError } from "../middleware/error.middleware";

export const createSeanceSchema = z.object({
  nom: z.string().min(1, "Le nom est requis").max(200),
  type: z.string().min(1, "Le type est requis").max(100),
  description: z.string().optional(),
  centreId: z.number().int("L'identifiant du centre est requis"),
  coachIds: z.array(z.number().int()).optional(),
});

export const updateSeanceSchema = z.object({
  nom: z.string().min(1).max(200).optional(),
  type: z.string().min(1).max(100).optional(),
  description: z.string().optional(),
  centreId: z.number().int().optional(),
  coachIds: z.array(z.number().int()).optional(),
});

// GET /api/centres/:centreId/seances (public, avec moyenne des avis)
export async function getSeancesByCentre(req: Request, res: Response, next: NextFunction) {
  try {
    const centreId = Number(req.params.centreId);
    const seances = await prisma.seanceEMS.findMany({
      where: { centreId },
      include: {
        centre: { select: { id: true, nom: true, ville: true } },
        coachs: {
          include: {
            coach: { select: { id: true, prenom: true, nom: true, specialite: true } },
          },
        },
        avis: {
          select: { note: true },
        },
      },
      orderBy: { nom: "asc" },
    });

    const resultat = seances.map((seance) => {
      const totalNotes = seance.avis.length;
      const sommeNotes = seance.avis.reduce((acc, a) => acc + a.note, 0);
      const moyenne = totalNotes > 0 ? Number((sommeNotes / totalNotes).toFixed(1)) : null;
      const { avis, ...reste } = seance;
      return {
        ...reste,
        totalAvis: totalNotes,
        moyenneNote: moyenne,
      };
    });

    return ok(res, resultat);
  } catch (err) {
    next(err);
  }
}

// GET /api/seances/:id (public, détail avec moyenne et coachs)
export async function getSeanceById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const seance = await prisma.seanceEMS.findUnique({
      where: { id },
      include: {
        centre: true,
        coachs: {
          include: {
            coach: true,
          },
        },
        avis: {
          include: {
            utilisateur: { select: { id: true, prenom: true, nom: true } },
            coach: { select: { id: true, prenom: true, nom: true } },
          },
          orderBy: { dateCreation: "desc" },
        },
      },
    });

    if (!seance) throw new ApiError(404, "Séance introuvable");

    const totalNotes = seance.avis.length;
    const sommeNotes = seance.avis.reduce((acc, a) => acc + a.note, 0);
    const moyenne = totalNotes > 0 ? Number((sommeNotes / totalNotes).toFixed(1)) : null;

    return ok(res, {
      ...seance,
      totalAvis: totalNotes,
      moyenneNote: moyenne,
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/seances (ADMINISTRATEUR uniquement)
export async function createSeance(req: Request, res: Response, next: NextFunction) {
  try {
    const { nom, type, description, centreId, coachIds } = req.body;

    const centre = await prisma.centreImotion.findUnique({ where: { id: centreId } });
    if (!centre) throw new ApiError(404, "Centre introuvable");

    const seance = await prisma.seanceEMS.create({
      data: {
        nom,
        type,
        description,
        centreId,
        ...(coachIds && coachIds.length > 0
          ? {
              coachs: {
                create: coachIds.map((coachId: number) => ({ coachId })),
              },
            }
          : {}),
      },
      include: {
        coachs: { include: { coach: true } },
      },
    });

    return ok(res, seance, 201);
  } catch (err) {
    next(err);
  }
}

// PUT /api/seances/:id (ADMINISTRATEUR uniquement)
export async function updateSeance(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const { nom, type, description, centreId, coachIds } = req.body;

    const existant = await prisma.seanceEMS.findUnique({ where: { id } });
    if (!existant) throw new ApiError(404, "Séance introuvable");

    if (centreId) {
      const centre = await prisma.centreImotion.findUnique({ where: { id: centreId } });
      if (!centre) throw new ApiError(404, "Centre introuvable");
    }

    if (coachIds !== undefined) {
      await prisma.seanceCoach.deleteMany({ where: { seanceId: id } });
      if (coachIds.length > 0) {
        await prisma.seanceCoach.createMany({
          data: coachIds.map((coachId: number) => ({ seanceId: id, coachId })),
        });
      }
    }

    const seance = await prisma.seanceEMS.update({
      where: { id },
      data: {
        ...(nom !== undefined && { nom }),
        ...(type !== undefined && { type }),
        ...(description !== undefined && { description }),
        ...(centreId !== undefined && { centreId }),
      },
      include: {
        coachs: { include: { coach: true } },
      },
    });

    return ok(res, seance);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/seances/:id (ADMINISTRATEUR uniquement)
export async function deleteSeance(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const existant = await prisma.seanceEMS.findUnique({ where: { id } });
    if (!existant) throw new ApiError(404, "Séance introuvable");

    await prisma.seanceEMS.delete({ where: { id } });
    return ok(res, { deleted: true });
  } catch (err) {
    next(err);
  }
}
