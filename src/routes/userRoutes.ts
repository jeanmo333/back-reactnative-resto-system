import express from "express";
const router = express.Router();
import { UserController } from "../controllers/UserController";
import { authMiddleware } from "../middlewares/authMiddleware";
import { isAdmin } from "../middlewares/checkRoles";

router.post("/", new UserController().create);
router.post("/login", new UserController().login);
router.get("/confirm-account/:token", new UserController().confirmAccount);
router.post("/forget-password", new UserController().forgetPassword);
router.get("/forget-password/:token", new UserController().verifyToken);
router.post("/forget-password/:token", new UserController().newPassword);

//protected routes
router.use(authMiddleware);
router.get("/profile", new UserController().getProfile);
router.put(
  "/update-profile-with-image",
  new UserController().updateProfileWithImage
);
router.put(
  "/update-profile-without-image",
  new UserController().updateProfileWithoutImage
);
router.put("/update-password", new UserController().updatePassword);

router.use(isAdmin);
router.get("/admin", new UserController().getByAdmin);
router.patch(
  "/admin/update-status/:id",
  new UserController().changeSatusByAdmin
);

router.patch("/admin/update-role/:id", new UserController().changeRoleByAdmin);

export default router;
