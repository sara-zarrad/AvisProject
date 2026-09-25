import { Request, Response, NextFunction } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { prisma } from "../config/db";
import { env } from "../config/env";
import { ok } from "../utils/response";
import { ApiError } from "../middleware/error.middleware";

export const registerSchema = z.object({
  prenom: z.string().min(1),
  nom: z.string().min(1),
  email: z.string().email(),
  motDePasse: z.string().min(6),
});

export const loginSchema = z.object({
  email: z.string().email(),
  motDePasse: z.string().min(1),
});

function signToken(id: number, role: string) {
  return jwt.sign({ id, role }, env.jwtSecret, {
    expiresIn: env.jwtExpiresIn,
  } as jwt.SignOptions);
}

export async function register(req: Request, res: Response, next: NextFunction) {
  try {
    const { prenom, nom, email, motDePasse } = req.body;

    const existant = await prisma.utilisateur.findUnique({ where: { email } });
    if (existant) throw new ApiError(409, "Cet email est déjà utilisé");

    const hash = await bcrypt.hash(motDePasse, 10);
    const utilisateur = await prisma.utilisateur.create({
      data: { prenom, nom, email, motDePasse: hash },
    });

    const token = signToken(utilisateur.id, utilisateur.role);
    return ok(
      res,
      {
        token,
        user: {
          id: utilisateur.id,
          prenom: utilisateur.prenom,
          nom: utilisateur.nom,
          email: utilisateur.email,
          role: utilisateur.role,
        },
      },
      201
    );
  } catch (err) {
    next(err);
  }
}

export async function login(req: Request, res: Response, next: NextFunction) {
  try {
    const { email, motDePasse } = req.body;

    const utilisateur = await prisma.utilisateur.findUnique({ where: { email } });
    if (!utilisateur) throw new ApiError(401, "Email ou mot de passe incorrect");

    const valide = await bcrypt.compare(motDePasse, utilisateur.motDePasse);
    if (!valide) throw new ApiError(401, "Email ou mot de passe incorrect");

    const token = signToken(utilisateur.id, utilisateur.role);
    return ok(res, {
      token,
      user: {
        id: utilisateur.id,
        prenom: utilisateur.prenom,
        nom: utilisateur.nom,
        email: utilisateur.email,
        role: utilisateur.role,
      },
    });
  } catch (err) {
    next(err);
  }
}

export async function me(req: Request, res: Response, next: NextFunction) {
  try {
    const utilisateur = await prisma.utilisateur.findUnique({
      where: { id: req.user!.id },
      select: { id: true, prenom: true, nom: true, email: true, role: true, dateInscrit: true },
    });
    if (!utilisateur) throw new ApiError(404, "Utilisateur introuvable");
    return ok(res, utilisateur);
  } catch (err) {
    next(err);
  }
}