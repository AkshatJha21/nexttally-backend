import { Request, Response } from "express";
import { newMovieSchema } from "../../../helpers/zod";
import { db } from "../../../lib/db";


export const addMovie = async (req: Request, res: Response) => {
    try {
        const body = await req.body;
        const parsedBody = newMovieSchema.safeParse(body);

        if (!parsedBody.success) {
            res.status(400).json({
                error: "Invalid inputs"
            });
            return;
        }

        const { branchId, managerId, movieName, seatCategory } = parsedBody.data;

        const branch = await db.branch.findUnique({
            where: {
                id: branchId
            },
            include: {
                manager: true
            }
        });

        if (!branch) {
            res.status(400).json({
                error: "Branch not found"
            });
            return;
        }

        if (branch.managerId !== managerId) {
            res.status(403).json({
                error: "Manager does not have access to this branch"
            });
            return;
        }

        const newMovie = await db.$transaction(async (db) => {
            const movie = await db.movie.create({
                data: {
                    title: movieName,
                    branchId: branchId
                }
            });

            await db.seatCategory.create({
                data: {
                    name: seatCategory.categoryName,
                    price: seatCategory.price,
                    movieId: movie.id,
                    totalSeats: seatCategory.totalSeats
                }
            });

            return movie;
        });

        res.status(201).json({
            message: "Movie and seat category created successfully",
            movie: newMovie
        });
    } catch (error) {
        console.error('Error adding movie and seat categories:', error);
        res.status(500).json({
            error: "Something went wrong while creating new movie"
        });
    }
}