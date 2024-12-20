import { Request, Response } from "express";
import { db } from "../../../lib/db";
import { adminSignupInput } from "../../../helpers/zod";
import { genSalt, hash } from "bcrypt";
import { sign } from "jsonwebtoken";
import { JWT_SECRET } from "../../../helpers/constants";

export const adminSignup = async (req: Request, res: Response) => {
    try {
        const body = await req.body;
        const parsedBody = adminSignupInput.safeParse(body);

        if (!parsedBody.success) {
            res.status(400).json({
                error: "Invalid inputs",
                issues: parsedBody.error
            });
            return;
        }

        const {
            adminEmail,
            adminPassword,
            adminName,
        } = parsedBody.data;

        const existingAdmin = await db.admin.findUnique({
            where: { 
                email: adminEmail 
            }
        });

        if (existingAdmin) {
            res.status(403).json({ 
                error: "Admin with this email already exists" 
            });
            return;
        }

        const salt = await genSalt(10);
        const adminHashedPassword = await hash(adminPassword, salt);

        const newAdmin = await db.admin.create({
            data: {
                name: adminName,
                email: adminEmail,
                password: adminHashedPassword
            }
        })

        const token = sign({ id: newAdmin.id }, JWT_SECRET);

        res.status(201).json({
            message: "Admin created successfully",
            admin: newAdmin,
            token: token
        });
    } catch (error) {
        console.error("Error creating admin:", error);
        res.status(500).json({
            error: "Something went wrong while creating admin" 
        });
    }
}