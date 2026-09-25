import { Router } from "express";
import {
  getAllCentres,
  getCentreById,
  createCentre,
  updateCentre,
  deleteCentre,
  createCentreSchema,
  updateCentreSchema,
} from "../controllers/centre.controller";
import { getSeancesByCentre } from "../controllers/seance.controller";
import { getCoachsByCentre } from "../controllers/coach.controller";
import { authenticate, requireRole } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { RoleUtilisateur } from "@prisma/client";

const router = Router();

// Routes publiques
router.get("/", getAllCentres);
router.get("/:id", getCentreById);
router.get("/:centreId/seances", getSeancesByCentre);
router.get("/:centreId/coachs", getCoachsByCentre);

// Routes ADMINISTRATEUR
router.post(
  "/",
  authenticate,
  requireRole(RoleUtilisateur.ADMINISTRATEUR),
  validate(createCentreSchema),
  createCentre
);
router.put(
  "/:id",
  authenticate,
  requireRole(RoleUtilisateur.ADMINISTRATEUR),
  validate(updateCentreSchema),
  updateCentre
);
router.delete(
  "/:id",
  authenticate,
  requireRole(RoleUtilisateur.ADMINISTRATEUR),
  deleteCentre
);

export default router;
