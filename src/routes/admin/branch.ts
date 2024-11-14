import { Router, Request, Response } from "express";
import { getBranches, addBranch } from "../../controllers/admin/branchController";

const branchRouter = Router();

branchRouter.get('/', getBranches);
branchRouter.post('/', addBranch);

export default branchRouter;