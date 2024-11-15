import { Router } from "express";
import branchRouter from "../admin/branch";
import bookingRouter from "./booking";
import managerLoginRouter from "./login";
import movieRouter from "./movie";

const managerRouter = Router();

managerRouter.use('/branch', branchRouter);
managerRouter.use('/booking', bookingRouter);
managerRouter.use('/login', managerLoginRouter);
managerRouter.use('/movie', movieRouter);

export default managerRouter;