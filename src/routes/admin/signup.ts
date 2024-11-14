import { Router, Request, Response } from "express";

const signupRouter = Router();

signupRouter.get('/', (req: Request, res: Response) => {
    res.send("admin signup");
});

export default signupRouter;