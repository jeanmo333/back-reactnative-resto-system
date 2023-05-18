import express from "express";
const router = express.Router();
import { authMiddleware } from "../middlewares/authMiddleware";
import { AddressController } from "../controllers/AddressController";

//protected routes
router.use(authMiddleware);
router.post("/", new AddressController().create);
router.get("/", new AddressController().findAll);
router.get("/:term", new AddressController().findOne);
router.patch("/:id", new AddressController().update);
router.delete("/:id", new AddressController().remove);

export default router;
