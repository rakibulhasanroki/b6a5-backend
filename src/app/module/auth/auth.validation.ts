import { z } from "zod";

export const registerSchema = z.object({
  name: z
    .string("Name is required")
    .min(2, "Name must be at least 2 characters"),
  email: z.email({
    error: (issue) =>
      issue.input === undefined ? "Email is required" : "Invalid email",
  }),
  password: z
    .string("Password is required")
    .min(6, "Password must be at least 6 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
      "Password must include uppercase, lowercase, and a number",
    ),
});

export const loginSchema = z.object({
  email: z.email({
    error: (issue) =>
      issue.input === undefined ? "Email is required" : "Invalid email",
  }),
  password: z
    .string("Password is required")
    .min(6, "Password must be at least 6 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
      "Password must include uppercase, lowercase, and a number",
    ),
});
