import { Router } from "express";
import { adminSignup } from "../../controllers/admin/signupController";

const signupRouter = Router();

signupRouter.post('/', adminSignup);

export default signupRouter;