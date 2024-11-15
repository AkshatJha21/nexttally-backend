import { Request, Response } from "express";
import { db } from "../../../lib/db";


export const getManagerBranch = async (req: Request, res: Response) => {
    try {
        const managerId = parseInt(req.query.managerId as string, 10);

        if (!managerId || isNaN(managerId)) {
            res.status(400).json({
                error: 'Manager ID is required and must be a valid integer'
            });
            return;
        }

        const manager = await db.manager.findUnique({
            where: {
                id: managerId
            },
            include: {
                branch: true
            }
        });

        if (!manager || !manager.branch) {
            res.status(400).json({
                error: "Manager not found or not associated with any branch"
            });
            return;
        }

        const branchId = manager.branch.id;

        const branchDetails = await db.branch.findUnique({
            where: {
                id: branchId
            },
            include: {
                movies: {
                    include: {
                        seatCategories: {
                            include: {
                                seatBookings: true
                            }
                        }
                    }
                },
                manager: true
            }
        });

        if (!branchDetails) {
            res.status(400).json({
                error: "Branch details not found"
            });
            return;
        }

        const branchWithRevenue = {
            ...branchDetails,
            movies: branchDetails.movies.map(movie => {
                let totalMovieRevenue = 0;

                const seatCategoriesWithRevenue = movie.seatCategories.map(category => {
                    const totalSeatsOccupied = category.seatBookings.reduce(
                        (sum, booking) => sum + booking.seatsOccupied,
                        0
                    );
                    const categoryRevenue = totalSeatsOccupied * category.price;
                    totalMovieRevenue += categoryRevenue;

                    return {
                        ...category,
                        totalSeatsOccupied,
                        categoryRevenue
                    }
                });

                return {
                    ...movie,
                    seatCategoriesWithRevenue,
                    totalMovieRevenue
                };
            })
        };

        res.status(200).json({
            branch: branchWithRevenue
        });
        return;
    } catch (error) {
        console.error("Error while fetching branch details: ", error);
        res.status(500).json({
            error: "Error while fetching branch details"
        });
    }
}