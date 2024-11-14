import { Router, Request, Response } from "express";

const managerRouter = Router();

managerRouter.get('/', (req: Request, res: Response) => {
    res.send('manager working');
});

export default managerRouter;