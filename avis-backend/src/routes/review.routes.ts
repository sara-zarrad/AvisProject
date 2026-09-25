import { Router } from "express";
import {
  getAllAvis,
  getAvisStats,
  getReviewsBySeance,
  createReview,
  updateReview,
  deleteReview,
  getMyReviews,
  createReviewSchema,
  updateReviewSchema,
} from "../controllers/review.controller";
import { authenticate, requireRole } from "../middleware/auth.middleware";
import { validate } from "../middleware/validate.middleware";
import { RoleUtilisateur } from "@prisma/client";

const router = Router();

// Routes d'administration des avis (filtrage par sentiment, centre, client, note, etc.)
router.get(
  "/avis",
  authenticate,
  requireRole(RoleUtilisateur.ADMINISTRATEUR),
  getAllAvis
);
router.get(
  "/reviews",
  authenticate,
  requireRole(RoleUtilisateur.ADMINISTRATEUR),
  getAllAvis
);
router.get(
  "/avis/stats",
  authenticate,
  requireRole(RoleUtilisateur.ADMINISTRATEUR),
  getAvisStats
);
router.get(
  "/reviews/stats",
  authenticate,
  requireRole(RoleUtilisateur.ADMINISTRATEUR),
  getAvisStats
);

// Routes des avis par séance
router.get("/seances/:seanceId/reviews", getReviewsBySeance);
router.post(
  "/seances/:seanceId/reviews",
  authenticate,
  validate(createReviewSchema),
  createReview
);

// Routes directes des avis
router.get("/reviews/me", authenticate, getMyReviews);
router.put(
  "/reviews/:id",
  authenticate,
  validate(updateReviewSchema),
  updateReview
);
router.delete("/reviews/:id", authenticate, deleteReview);

export default router;
