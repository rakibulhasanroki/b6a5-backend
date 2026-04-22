/* eslint-disable @typescript-eslint/no-explicit-any */
import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { AuthService } from "./auth.service";
import { toHeaders } from "../../utils/toHeaders";
import { envVars } from "../../config/env";
import AppError from "../../errorHelpers/AppError";

const register = catchAsync(async (req, res) => {
  const result = await AuthService.registerUser(req.body);

  result?.headers?.forEach((value, key) => {
    res.setHeader(key, value);
  });
  sendResponse(res, {
    httpStatus: status.CREATED,
    success: true,
    message: "User registered successfully",
    data: result.response.user,
  });
});

const login = catchAsync(async (req, res) => {
  const headers = toHeaders(req.headers);

  try {
    const result = await AuthService.loginUser(req.body, headers);

    result.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    sendResponse(res, {
      httpStatus: status.OK,
      success: true,
      message: "User logged in successfully",
      data: result.response.user,
    });
  } catch (error: any) {
    if (error.message === "ACCOUNT_DELETED") {
      throw new AppError(status.FORBIDDEN, "Your account has been deleted");
    }

    if (error.message === "ACCOUNT_INACTIVE") {
      throw new AppError(status.FORBIDDEN, "Your account has been inactive");
    }

    throw error;
  }
});
const changePassword = catchAsync(async (req, res) => {
  const headers = toHeaders(req.headers);

  const result = await AuthService.changePassword(req.body, headers);

  result?.headers?.forEach((value, key) => {
    res.setHeader(key, value);
  });

  sendResponse(res, {
    httpStatus: status.OK,
    success: true,
    message: "Password changed successfully",
  });
});

const googleCallback = catchAsync(async (req, res) => {
  const headers = toHeaders(req.headers);

  const redirect = req.query.redirect;

  const safeRedirect =
    !redirect || ["/login", "/register"].includes(redirect as string)
      ? "/"
      : redirect;
  const redirectPath = safeRedirect || "/dashboard";

  try {
    const result = await AuthService.googleCallback(headers);

    result.headers.forEach((value, key) => {
      res.setHeader(key, value);
    });

    return res.redirect(`${envVars.FRONTEND_URL}${redirectPath}`);
  } catch (error: any) {
    if (error.message === "ACCOUNT_INACTIVE") {
      return res.redirect(
        `${envVars.FRONTEND_URL}/login?error=account_inactive`,
      );
    }

    return res.redirect(`${envVars.FRONTEND_URL}/login`);
  }
});

export const AuthController = {
  register,
  login,
  changePassword,
  googleCallback,
};
