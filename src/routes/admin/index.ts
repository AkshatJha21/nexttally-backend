import { Router, Request, Response } from "express";
import branchRouter from "./branch";
import loginRouter from "./login";
import signupRouter from "./signup";

const adminRouter = Router();

adminRouter.use('/branch', branchRouter);
adminRouter.use('/login', loginRouter);
adminRouter.use('/signup', signupRouter);

export default adminRouter;