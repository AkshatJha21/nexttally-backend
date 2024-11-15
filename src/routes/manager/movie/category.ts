import { Router } from "express";
import { createCategory } from "../../../controllers/manager/categoryController";

const categoryRouter = Router();

categoryRouter.post('/', createCategory);

export default categoryRouter;