import express from "express";
const router = express.Router();
import { UserController } from '../controllers/UserController'
import { authMiddleware } from '../middlewares/authMiddleware'
import { isAdmin } from "../middlewares/checkRoles";



router.post('/', new UserController().create)
router.post('/login', new UserController().login)
router.get("/confirm-account/:token", new UserController().confirmAccount);
router.post("/forget-password", new UserController().forgetPassword);
router.get("/forget-password/:token", new UserController().verifyToken);
router.post("/forget-password/:token", new UserController().newPassword);


//protected routes
router.use(authMiddleware)
router.get('/profile', new UserController().getProfile)
router.put("/profile/:id",new UserController().updateProfile);
router.put("/update-password",new UserController().updatePassword );



router.use(isAdmin)
router.post('/admin', new UserController().createByAdmin)
router.get("/admin", new UserController().getAllUsersByAdmin)
router.put("/admin/:id", new UserController().updateUserByAdmin)


export default router
