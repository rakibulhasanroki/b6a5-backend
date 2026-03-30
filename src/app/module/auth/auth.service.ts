import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { auth } from "../../lib/auth";
import { LoginPayload, RegisterPayload } from "./auth.interface";

const registerUser = async (payload: RegisterPayload) => {
  const { name, email, password } = payload;

  const data = await auth.api.signUpEmail({
    body: {
      name,
      email,
      password,
    },
  });

  if (!data.user) {
    throw new AppError(status.BAD_REQUEST, "Registration failed");
  }

  return data;
};

const loginUser = async (payload: LoginPayload) => {
  const { email, password } = payload;

  const data = await auth.api.signInEmail({
    body: {
      email,
      password,
    },
  });

  if (!data.user) {
    throw new AppError(status.BAD_REQUEST, "Invalid credentials");
  }

  return data;
};

export const AuthService = {
  registerUser,
  loginUser,
};
