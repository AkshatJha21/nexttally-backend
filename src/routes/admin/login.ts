import { Router } from "express";
import { adminLogin } from "../../controllers/admin/loginController";

const loginRouter = Router();

loginRouter.post('/', adminLogin);

export default loginRouter;