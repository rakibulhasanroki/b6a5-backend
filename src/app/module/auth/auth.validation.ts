import { z } from "zod";

const nameField = z
  .string({ error: "Name is required" })
  .trim()
  .min(2, "Name must be at least 2 characters")
  .max(50, "Name is too long");

const emailField = z
  .email({
    error: (issue) =>
      issue.input === undefined ? "Email is required" : "Invalid email",
  })
  .transform((val) => val.toLowerCase());

const passwordField = z
  .string({ error: "Password is required" })
  .min(8, "Password must be at least 8 characters")
  .max(128, "Password is too long")
  .regex(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/,
    "Password must include uppercase, lowercase, and a number",
  );

const registerSchema = z.object({
  name: nameField,
  email: emailField,
  password: passwordField,
});

const loginSchema = z.object({
  email: emailField,
  password: passwordField,
});

const changePasswordSchema = z
  .object({
    currentPassword: passwordField,

    newPassword: passwordField,
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  });

export const AuthValidation = {
  registerSchema,
  loginSchema,
  changePasswordSchema,
};
