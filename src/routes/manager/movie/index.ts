import { Router } from "express";
import categoryRouter from "./category";
import { addMovie } from "../../../controllers/manager/movieController";

const movieRouter = Router();

movieRouter.use('/category', categoryRouter);

movieRouter.post('/', addMovie);

export default movieRouter;