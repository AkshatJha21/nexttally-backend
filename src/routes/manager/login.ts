import { Router } from "express";
import { managerLogin } from "../../controllers/manager/loginController";

const managerLoginRouter = Router();

managerLoginRouter.post('/', managerLogin);

export default managerLoginRouter;