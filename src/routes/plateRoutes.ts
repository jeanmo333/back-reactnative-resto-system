import express from "express";
const router = express.Router();
const multer = require("multer");
import { authMiddleware } from "../middlewares/authMiddleware";
import { PlateController } from "../controllers/PlateController";

const upload = multer({
  storage: multer.memoryStorage(),
});
//upload.array("archives", 3),
//protected routes
router.use(authMiddleware);
router.post("/", new PlateController().create);
router.get("/", new PlateController().findAll);
router.get("/:term", new PlateController().findOne);
router.patch("/:id", new PlateController().update);
router.delete("/:id", new PlateController().remove);

export default router;
