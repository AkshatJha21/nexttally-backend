import { Router, Request, Response } from "express";

const adminRouter = Router();

adminRouter.get('/', (req: Request, res: Response) => {
    res.send('admin working');
});

export default adminRouter;