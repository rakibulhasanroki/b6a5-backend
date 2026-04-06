import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { auth } from "../../lib/auth";
import { LoginPayload, RegisterPayload } from "./auth.interface";

const registerUser = async (payload: RegisterPayload) => {
  const data = await auth.api.signUpEmail({
    body: payload,
  });

  if (!data.user) {
    throw new AppError(status.BAD_REQUEST, "Registration failed");
  }

  return data;
};

const loginUser = async (payload: LoginPayload, headers: Headers) => {
  const data = await auth.api.signInEmail({
    body: payload,
    headers,
    returnHeaders: true,
  });

  if (!data.response?.user) {
    throw new AppError(status.BAD_REQUEST, "Invalid credentials");
  }

  return data;
};

const changePassword = async (
  payload: { currentPassword: string; newPassword: string },
  headers: Headers,
) => {
  await auth.api.changePassword({
    body: {
      currentPassword: payload.currentPassword,
      newPassword: payload.newPassword,
      revokeOtherSessions: true,
    },
    headers,
  });
};

const logout = async (headers: Headers) => {
  await auth.api.signOut({
    headers,
  });
};

const googleCallback = async (headers: Headers) => {
  const data = await auth.api.getSession({
    headers,
    returnHeaders: true,
  });

  if (!data.response?.user) {
    throw new AppError(status.UNAUTHORIZED, "Google login failed");
  }

  if (!data.response.user.emailVerified) {
    await auth.api.updateUser({
      body: {
        emailVerified: true,
      },
      headers,
    });
  }

  return data;
};

export const AuthService = {
  registerUser,
  loginUser,
  changePassword,
  logout,
  googleCallback,
};
