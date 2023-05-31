import express from "express";
const router = express.Router();
import { authMiddleware } from "../middlewares/authMiddleware";
import { DashboardController } from "../controllers/DashboardController";

//protected routes
router.use(authMiddleware);
router.get("/", new DashboardController().dashboard);

export default router;
