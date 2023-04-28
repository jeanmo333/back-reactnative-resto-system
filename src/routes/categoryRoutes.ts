import express from "express";
const router = express.Router();
import { authMiddleware } from '../middlewares/authMiddleware'
import { CategoryController } from "../controllers/CategoryController";


//protected routes
router.use(authMiddleware)
router.post('/', new CategoryController().create)
router.get('/', new CategoryController().findAll)
router.get('/:term', new CategoryController().findOne)
router.patch('/:id', new CategoryController().update)
router.delete('/:id', new CategoryController().remove)


export default router;