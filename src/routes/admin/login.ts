import { Router, Request, Response } from "express";

const loginRouter = Router();

loginRouter.get('/', (req: Request, res: Response) => {
    res.send("admin login");
});

export default loginRouter;