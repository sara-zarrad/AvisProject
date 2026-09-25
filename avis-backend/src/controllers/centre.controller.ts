import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { prisma } from "../config/db";
import { ok } from "../utils/response";
import { ApiError } from "../middleware/error.middleware";

export const createCentreSchema = z.object({
  nom: z.string().min(1, "Le nom est requis").max(200),
  ville: z.string().min(1, "La ville est requise").max(100),
  numTel: z.string().min(1, "Le numéro de téléphone est requis").max(30),
  adresse: z.string().min(1, "L'adresse est requise"),
  description: z.string().optional(),
});

export const updateCentreSchema = z.object({
  nom: z.string().min(1).max(200).optional(),
  ville: z.string().min(1).max(100).optional(),
  numTel: z.string().min(1).max(30).optional(),
  adresse: z.string().min(1).optional(),
  description: z.string().optional(),
});

// GET /api/centres (public, liste tous les centres avec leur nombre de séances)
export async function getAllCentres(_req: Request, res: Response, next: NextFunction) {
  try {
    const centres = await prisma.centreImotion.findMany({
      include: {
        _count: {
          select: { seances: true, coachs: true },
        },
      },
      orderBy: { nom: "asc" },
    });
    return ok(res, centres);
  } catch (err) {
    next(err);
  }
}

// GET /api/centres/:id (public, détail d'un centre)
export async function getCentreById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const centre = await prisma.centreImotion.findUnique({
      where: { id },
      include: {
        coachs: true,
        seances: {
          include: {
            coachs: {
              include: { coach: true },
            },
          },
        },
      },
    });
    if (!centre) throw new ApiError(404, "Centre introuvable");
    return ok(res, centre);
  } catch (err) {
    next(err);
  }
}

// POST /api/centres (ADMINISTRATEUR uniquement)
export async function createCentre(req: Request, res: Response, next: NextFunction) {
  try {
    const { nom, ville, numTel, adresse, description } = req.body;
    const centre = await prisma.centreImotion.create({
      data: { nom, ville, numTel, adresse, description },
    });
    return ok(res, centre, 201);
  } catch (err) {
    next(err);
  }
}

// PUT /api/centres/:id (ADMINISTRATEUR uniquement)
export async function updateCentre(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const existant = await prisma.centreImotion.findUnique({ where: { id } });
    if (!existant) throw new ApiError(404, "Centre introuvable");

    const centre = await prisma.centreImotion.update({
      where: { id },
      data: req.body,
    });
    return ok(res, centre);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/centres/:id (ADMINISTRATEUR uniquement)
export async function deleteCentre(req: Request, res: Response, next: NextFunction) {
  try {
    const id = Number(req.params.id);
    const existant = await prisma.centreImotion.findUnique({ where: { id } });
    if (!existant) throw new ApiError(404, "Centre introuvable");

    await prisma.centreImotion.delete({ where: { id } });
    return ok(res, { deleted: true });
  } catch (err) {
    next(err);
  }
}
