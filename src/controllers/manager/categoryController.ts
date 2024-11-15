import { Request, Response } from "express";
import { seatCategorySchema } from "../../../helpers/zod";
import { db } from "../../../lib/db";


export const createCategory =  async (req: Request, res: Response) => {
    try {
        const body = await req.body;
        const parsedBody = seatCategorySchema.safeParse(body);

        if (!parsedBody.success) {
            res.status(400).json({
                error: "Invalid inputs"
            });
            return;
        }

        const { managerId, movieId, seatCategory } = parsedBody.data;

        const movie = await db.movie.findUnique({
            where: {
                id: movieId
            },
            include: {
                branch: true
            }
        });

        if (!movie) {
            res.status(400).json({
                error: "Movie not found"
            });
            return;
        }

        if (movie.branch.managerId !== managerId) {
            res.status(403).json({
                error: "Manager does not have access to this movie"
            });
        }

        const newSeatCategory = await db.seatCategory.create({
            data: {
                name: seatCategory.categoryName,
                price: seatCategory.price,
                totalSeats: seatCategory.totalSeats,
                movieId: movieId,
            }
        })

        res.status(201).json({
            message: "Seat category created successfully",
            seatCategory: newSeatCategory
        });
    } catch (error) {
        console.error('Error adding seat category:', error);
        res.status(500).json({
            error: "Something went wrong while creating new seat category"
        });
    }
}