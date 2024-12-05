import { Router } from "express";
import { getBranches, addBranch, allBranches } from "../../controllers/admin/branchController";

const branchRouter = Router();

branchRouter.get('/', getBranches);
branchRouter.get('/all', allBranches);
branchRouter.post('/', addBranch);

export default branchRouter;