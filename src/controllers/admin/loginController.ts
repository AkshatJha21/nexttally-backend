import { Request, Response } from "express";
import { db } from "../../../lib/db";
import { adminLoginInput } from "../../../helpers/zod";
import { compare } from "bcrypt";
import { JWT_SECRET } from "../../../helpers/constants";
import { sign } from "jsonwebtoken";

export const adminLogin = async (req: Request, res: Response) => {
    try {
        const body = await req.body;
        const parsedBody = await adminLoginInput.safeParse(body);

        if (!parsedBody.success) {
            res.status(400).json({
                error: "Invalid inputs"
            });
            return;
        }

        const { email, password } = parsedBody.data;

        const admin = await db.admin.findUnique({
            where: { 
                email: email 
            }
        });

        if (!admin) {
            res.status(403).json({ 
                error: "Admin does not exist" 
            });
            return;
        }

        const validPassword = await compare(password, admin.password);

        if (!validPassword) {
            res.status(403).json({ 
                error: "Password is incorrect" 
            });
            return;
        }

        const token = sign({ id: admin.id }, JWT_SECRET);

        res.status(201).json({
            message: "Admin login successful",
            token: token
        });
    } catch (error) {
        console.error("Error while admin login:", error);
        res.status(500).json({ 
            error: "Admin login failed" 
        });
    }
}