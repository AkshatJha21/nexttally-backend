import { Router, Request, Response } from "express";

const branchRouter = Router();

branchRouter.get('/', (req: Request, res: Response) => {
    res.send("admin branch");
});

export default branchRouter;