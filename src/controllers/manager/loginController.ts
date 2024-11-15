import { Request, Response } from "express";
import { managerLoginInput } from "../../../helpers/zod";
import { db } from "../../../lib/db";
import { compare } from "bcrypt";
import { sign } from "jsonwebtoken";
import { JWT_SECRET } from "../../../helpers/constants";


export const managerLogin = async (req: Request, res: Response) => {
    try {
        const body = await req.body;
        const parsedBody = managerLoginInput.safeParse(body);

        if (!parsedBody.success) {
            res.status(400).json({
                error: "Invalid inputs"
            });
            return;
        }

        const manager = await db.manager.findUnique({
            where: {
                email: body.email
            }
        });

        if (!manager) {
            res.status(400).json({
                error: "Manager does not exist"
            });
            return;
        }

        const validPassword = await compare(body.password, manager.password);

        if (!validPassword) {
            res.status(400).json({
                error: "Password is incorrect"
            });
            return;
        } else {
            const token = await sign({ id: manager.id }, JWT_SECRET);
            res.status(201).json({
                message: "Manager login successful",
                token: token
            });
        }
    } catch (error) {
        console.error("Error while manager login: ", error);
        res.status(500).json({
            error: "Manager login failed"
        });
    }
}