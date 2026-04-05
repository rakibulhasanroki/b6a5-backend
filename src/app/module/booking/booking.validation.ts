import { z } from "zod";
import { BookingStatus } from "../../../generated/prisma/enums";

const createBookingSchema = z.object({
  eventId: z.string().min(1, "Event ID is required"),
  invitationId: z.string().optional(),
});

const updateBookingStatusSchema = z.object({
  status: z.enum([
    BookingStatus.PENDING,
    BookingStatus.CONFIRMED,
    BookingStatus.CANCELLED,
    BookingStatus.BANNED,
  ]),
});

export const BookingValidation = {
  createBookingSchema,
  updateBookingStatusSchema,
};
