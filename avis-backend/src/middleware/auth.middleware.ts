import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../config/env";
import { ApiError } from "./error.middleware";
import { RoleUtilisateur } from "@prisma/client";

interface JwtPayload {
  id: number;
  role: RoleUtilisateur;
}

export function authenticate(req: Request, _res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return next(new ApiError(401, "Token manquant"));
  }

  const token = header.split(" ")[1];
  try {
    const payload = jwt.verify(token, env.jwtSecret) as JwtPayload;
    req.user = { id: payload.id, role: payload.role };
    next();
  } catch {
    next(new ApiError(401, "Token invalide"));
  }
}

export function requireRole(...roles: RoleUtilisateur[]) {
  return (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(new ApiError(403, "Accès refusé"));
    }
    next();
  };
}