import { Router } from "express";
import {
  getCoachById,
  createCoach,
  updateCoach,
  deleteCoach,
  createCoachSchema,
  updateCoachSchema,
} from "../controllers/coach.controller";
import { authenticate, requireRole } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { RoleUtilisateur } from "@prisma/client";

const router = Router();

// Route publique
router.get("/:id", getCoachById);

// Routes ADMINISTRATEUR
router.post(
  "/",
  authenticate,
  requireRole(RoleUtilisateur.ADMINISTRATEUR),
  validate(createCoachSchema),
  createCoach
);
router.put(
  "/:id",
  authenticate,
  requireRole(RoleUtilisateur.ADMINISTRATEUR),
  validate(updateCoachSchema),
  updateCoach
);
router.delete(
  "/:id",
  authenticate,
  requireRole(RoleUtilisateur.ADMINISTRATEUR),
  deleteCoach
);

export default router;
