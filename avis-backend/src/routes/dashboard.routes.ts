import { Router } from "express";
import { getAdminDashboard } from "../controllers/dashboard.controller";
import { authenticate, requireRole } from "../middleware/auth.middleware";
import { RoleUtilisateur } from "@prisma/client";

const router = Router();

// Route tableau de bord (ADMINISTRATEUR uniquement)
router.get(
  "/dashboard",
  authenticate,
  requireRole(RoleUtilisateur.ADMINISTRATEUR),
  getAdminDashboard
);

export default router;
