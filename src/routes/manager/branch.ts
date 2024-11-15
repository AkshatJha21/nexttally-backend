import { Router } from "express";
import { getManagerBranch } from "../../controllers/manager/branchController";

const branchManagerRouter = Router();

branchManagerRouter.get('/', getManagerBranch);

export default branchManagerRouter;