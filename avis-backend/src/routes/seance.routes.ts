import { Router } from "express";
import {
  getSeanceById,
  createSeance,
  updateSeance,
  deleteSeance,
  createSeanceSchema,
  updateSeanceSchema,
} from "../controllers/seance.controller";
import { authenticate, requireRole } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { RoleUtilisateur } from "@prisma/client";

const router = Router();

// Route publique
router.get("/:id", getSeanceById);

// Routes ADMINISTRATEUR
router.post(
  "/",
  authenticate,
  requireRole(RoleUtilisateur.ADMINISTRATEUR),
  validate(createSeanceSchema),
  createSeance
);
router.put(
  "/:id",
  authenticate,
  requireRole(RoleUtilisateur.ADMINISTRATEUR),
  validate(updateSeanceSchema),
  updateSeance
);
router.delete(
  "/:id",
  authenticate,
  requireRole(RoleUtilisateur.ADMINISTRATEUR),
  deleteSeance
);

export default router;
