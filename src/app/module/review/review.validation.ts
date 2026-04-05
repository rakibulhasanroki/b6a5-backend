import { z } from "zod";

const createReviewSchema = z.object({
  eventId: z.string().uuid("Invalid event id"),

  rating: z
    .number()
    .int("Rating must be integer")
    .min(1, "Rating must be at least 1")
    .max(5, "Rating cannot exceed 5"),

  comment: z.string().min(5, "Comment must be at least 5 characters"),
});

const updateReviewSchema = z.object({
  rating: z.number().int().min(1).max(5).optional(),

  comment: z.string().min(5).optional(),
});

const getReviewsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
});

export const ReviewValidation = {
  createReviewSchema,
  updateReviewSchema,
  getReviewsQuerySchema,
};
