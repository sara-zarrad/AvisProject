import { Router } from "express";
import authRoutes from "./auth.routes";
import reviewRoutes from "./review.routes";
import centreRoutes from "./centre.routes";
import seanceRoutes from "./seance.routes";
import coachRoutes from "./coach.routes";
import dashboardRoutes from "./dashboard.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/", reviewRoutes);
router.use("/centres", centreRoutes);
router.use("/seances", seanceRoutes);
router.use("/coachs", coachRoutes);
router.use("/admin", dashboardRoutes);

export default router;