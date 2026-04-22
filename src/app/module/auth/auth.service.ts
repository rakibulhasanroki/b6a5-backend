import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { auth } from "../../lib/auth";
import { LoginPayload, RegisterPayload } from "./auth.interface";

const registerUser = async (payload: RegisterPayload) => {
  const data = await auth.api.signUpEmail({
    body: payload,
    returnHeaders: true,
  });

  const user = data.response?.user;
  if (!user) {
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

  const user = data.response?.user;

  if (!user) {
    throw new AppError(status.BAD_REQUEST, "Invalid credentials");
  }

  if (user.isDeleted) {
    await auth.api.signOut({ headers });
    throw new AppError(status.FORBIDDEN, "ACCOUNT_DELETED");
  }

  if (user.status !== "ACTIVE") {
    await auth.api.signOut({ headers });
    throw new AppError(status.FORBIDDEN, "ACCOUNT_INACTIVE");
  }

  return data;
};

const changePassword = async (
  payload: { currentPassword: string; newPassword: string },
  headers: Headers,
) => {
  const data = await auth.api.changePassword({
    body: {
      currentPassword: payload.currentPassword,
      newPassword: payload.newPassword,
      revokeOtherSessions: true,
    },
    headers,
    returnHeaders: true,
  });

  return data;
};

const googleCallback = async (headers: Headers) => {
  const data = await auth.api.getSession({
    headers,
    returnHeaders: true,
  });

  const user = data.response?.user;

  if (!user) {
    throw new AppError(status.UNAUTHORIZED, "Google login failed");
  }

  if (user.isDeleted || user.status !== "ACTIVE") {
    await auth.api.signOut({ headers });

    throw new AppError(status.FORBIDDEN, "ACCOUNT_INACTIVE");
  }

  if (!user.emailVerified) {
    await auth.api.updateUser({
      body: { emailVerified: true },
      headers,
    });
  }

  return data;
};

export const AuthService = {
  registerUser,
  loginUser,
  changePassword,
  googleCallback,
};
