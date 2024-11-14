import express, { Request, Response } from "express";
import cors from "cors";
import adminRouter from "./routes/admin";
import managerRouter from "./routes/manager";

const app = express();
const port = 3003;

app.use(cors());

app.use('/admin', adminRouter);
app.use('/manager', managerRouter);

app.get('/', (req: Request, res: Response) => {
    res.send("Server up and running");
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});