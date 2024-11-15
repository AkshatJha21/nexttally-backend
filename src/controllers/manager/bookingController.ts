import { Request, Response } from "express";
import { seatBookingSchema } from "../../../helpers/zod";
import { db } from "../../../lib/db";


export const seatsBooked = async (req: Request, res: Response) => {
    try {
        const body = await req.body;
        const parsedBody = seatBookingSchema.safeParse(body);

        if (!parsedBody.success) {
            res.status(400).json({
                error: "Invalid inputs"
            });
            return;
        }

        const { seatsOccupied, categoryId, bookingDate } = parsedBody.data;

        const seatCategory = await db.seatCategory.findUnique({
            where: {
                id: categoryId
            },
            include: {
                seatBookings: true
            }
        });

        if (!seatCategory) {
            res.status(400).json({
                error: "Seat category does not exist"
            });
            return;
        }

        const totalSeatsOccupiedToday = await db.seatBooking.aggregate({
            where: {
                categoryId: categoryId,
                bookingDate: new Date(bookingDate)
            },
            _sum: {
                seatsOccupied: true
            }
        });

        const totalSeatsBooked = totalSeatsOccupiedToday._sum.seatsOccupied || 0;

        const availableSeats = seatCategory.totalSeats - totalSeatsBooked;

        if (seatsOccupied > availableSeats) {
            res.status(400).json({
                error: `Cannot book more than ${availableSeats} seats in this category`
            });
            return;
        }

        const booking = await db.seatBooking.create({
            data: {
                seatsOccupied,
                bookingDate: new Date(bookingDate),
                category: {
                    connect: {
                        id: categoryId
                    }
                } 
            }
        });

        res.status(201).json({
            message: "Seat booking completed succesfully",
            booking: booking
        });
    } catch (error) {
        console.error("Error while booking seats: ", error);
        res.status(500).json({
            error: "Something went wrong while booking seats"
        });
    }
}