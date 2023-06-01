import express from "express";
const router = express.Router();
const multer = require("multer");
import { authMiddleware } from "../middlewares/authMiddleware";
import { OrderController } from "../controllers/OrderController";

const upload = multer({
  storage: multer.memoryStorage(),
});
//upload.array("archives", 3),
//protected routes
router.use(authMiddleware);
router.post("/", new OrderController().create);
router.get("/", new OrderController().findAll);
router.get("/my-orders", new OrderController().findMyOrders);
router.get("/:id", new OrderController().findOne);
router.patch("/update-status/:id", new OrderController().updateStatus);
export default router;
