import { Router } from "express";
import { seatsBooked } from "../../controllers/manager/bookingController";

const bookingRouter = Router();

bookingRouter.post('/', seatsBooked);

export default bookingRouter;