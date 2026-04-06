import z from "zod";

const updateUserSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must be under 50 characters")
      .optional(),

    phoneNumber: z
      .string()
      .trim()
      .regex(/^\+?[0-9]{7,15}$/, "Invalid phone number format")
      .optional(),

    bio: z
      .string()
      .trim()
      .max(300, "Bio must be under 300 characters")
      .optional(),

    image: z.url().optional(),
  })
  .strict();

const getUsersQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
});

export const UserValidation = {
  updateUserSchema,
  getUsersQuerySchema,
};
