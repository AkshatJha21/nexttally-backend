import { Request, Response } from "express";
import { db } from "../../../lib/db";
import { newBranchInput } from "../../../helpers/zod";
import { genSalt, hash } from "bcrypt";
import { verify } from "jsonwebtoken";
import { JWT_SECRET } from "../../../helpers/constants";

export const getBranches = async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(400).json({
                error: 'Bearer token not found'
            });
            return;
        }

        const obj = verify(authHeader.split(' ')[1], JWT_SECRET);
        
        if (obj) {
            const admin = await db.admin.findUnique({
                where: {
                    id: (obj as any).id
                }
            });

            if (!admin) {
                res.status(400).json({ 
                    error: "Admin not found" 
                });
                return;
            }

            const adminId = admin?.id;

            const branches = await db.branch.findMany({
                where: { adminId: adminId },
                include: {
                    manager: true,
                    movies: {
                        include: {
                            seatCategories: {
                                include: { seatBookings: true }
                            }
                        }
                    }
                }
            });

            if (!branches.length) {
                res.status(400).json({ 
                    error: "No branches found for this admin" 
                });
                return;
            }

            const branchWithRevenue = branches.map(branch => ({
                ...branch,
                movies: branch.movies.map(movie => {
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
                        };
                    });
    
                    return {
                        ...movie,
                        seatCategories: seatCategoriesWithRevenue,
                        totalMovieRevenue
                    };
                })
            }));
    
            res.status(200).json({ 
                branches: branchWithRevenue
            });
            return;

        } else {
            res.status(403).json({
                error: 'You are not authorized'
            });
            return;
        }

    } catch (error) {
        console.error("Error fetching branch details:", error);
        res.status(500).json({ 
            error: "Error while fetching branches" 
        });
        return;
    }
}

export const addBranch = async (req: Request, res: Response) => {
    try {
        const parsedBody = newBranchInput.safeParse(req.body);

        if (!parsedBody.success) {
            res.status(400).json({ error: "Invalid inputs" });
            return;
        }

        const { adminId, managerEmail, managerName, managerPassword, branchName, branchLocation } = parsedBody.data;

        const admin = await db.admin.findUnique({ where: { id: adminId } });
        if (!admin) {
            res.status(404).json({ error: "Admin not found" });
            return;
        }

        const existingManager = await db.manager.findUnique({ where: { email: managerEmail } });
        if (existingManager) {
            res.status(400).json({ error: "Manager with this email already exists" });
            return;
        }

        const salt = await genSalt(10);
        const managerHashedPassword = await hash(managerPassword, salt);

        const newBranch = await db.$transaction(async (db) => {
            const newManager = await db.manager.create({
                data: {
                    name: managerName,
                    email: managerEmail,
                    password: managerHashedPassword
                }
            });
            return await db.branch.create({
                data: {
                    name: branchName,
                    location: branchLocation,
                    adminId: adminId,
                    managerId: newManager.id
                }
            });
        });

        res.status(201).json({
            message: "Branch and manager added successfully",
            branch: newBranch
        });
    } catch (error) {
        console.error("Error while adding new branch:", error);
        res.status(500).json({ error: "Something went wrong while adding new branch" });
    }
}

export const allBranches = async (req: Request, res: Response) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(400).json({
                error: 'Bearer token not found'
            });
            return;
        }

        const obj = verify(authHeader.split(' ')[1], JWT_SECRET);
        
        if (obj) {
            const admin = await db.admin.findUnique({
                where: {
                    id: (obj as any).id
                }
            });

            if (!admin) {
                res.status(400).json({ 
                    error: "Admin not found" 
                });
                return;
            }

            const adminId = admin?.id;

            const branches = await db.branch.findMany({
                where: { adminId: adminId },
                include: {
                    manager: true,
                    movies: {
                        include: {
                            seatCategories: {
                                include: { seatBookings: true }
                            }
                        }
                    }
                }
            });

            if (!branches.length) {
                res.status(400).json({ 
                    error: "No branches found for this admin" 
                });
                return;
            }

            let totalRevenue = 0;
            let totalMovies = 0;
            let totalBookings = 0;

            const branchWithRevenue = branches.map(branch => {
                let branchRevenue = 0;
                const moviesWithRevenue = branch.movies.map(movie => {
                    totalMovies++;
                    let totalMovieRevenue = 0;

                    const seatCategoriesWithRevenue = movie.seatCategories.map(category => {
                        const totalSeatsOccupied = category.seatBookings.reduce((sum, booking) => sum + booking.seatsOccupied, 0);
                        const categoryRevenue = totalSeatsOccupied * category.price;
                        totalMovieRevenue += categoryRevenue;
                        branchRevenue += categoryRevenue;
                        totalBookings += category.seatBookings.length;

                        return {
                            ...category,
                            totalSeatsOccupied,
                            categoryRevenue
                        };
                    });

                    return {
                        ...movie,
                        seatCategories: seatCategoriesWithRevenue,
                        totalMovieRevenue
                    };
                });

                totalRevenue += branchRevenue;

                return {
                    ...branch,
                    movies: moviesWithRevenue,
                    branchRevenue
                };
            });
    
            res.status(200).json({ 
                // branches: branchWithRevenue,
                totalBranches: branches.length,
                totalRevenue,
                totalMovies,
                totalBookings
            });
            return;

        } else {
            res.status(403).json({
                error: 'You are not authorized'
            });
            return;
        }

    } catch (error) {
        console.error("Error fetching branch details:", error);
        res.status(500).json({ 
            error: "Error while fetching branches" 
        });
        return;
    }
}