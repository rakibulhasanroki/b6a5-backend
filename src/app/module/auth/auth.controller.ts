import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { AuthService } from "./auth.service";
import { toHeaders } from "../../utils/toHeaders";
import { envVars } from "../../config/env";

const register = catchAsync(async (req, res) => {
  const result = await AuthService.registerUser(req.body);

  sendResponse(res, {
    httpStatus: status.CREATED,
    success: true,
    message: "User registered successfully",
    data: result,
  });
});

const login = catchAsync(async (req, res) => {
  const headers = toHeaders(req.headers);
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
});

const changePassword = catchAsync(async (req, res) => {
  const headers = toHeaders(req.headers);

  await AuthService.changePassword(req.body, headers);

  sendResponse(res, {
    httpStatus: status.OK,
    success: true,
    message: "Password changed successfully",
  });
});

const logout = catchAsync(async (req, res) => {
  const headers = toHeaders(req.headers);

  await AuthService.logout(headers);

  sendResponse(res, {
    httpStatus: status.OK,
    success: true,
    message: "Logged out successfully",
  });
});

const googleLogin = catchAsync(async (req, res) => {
  res.render("googleRedirect", {
    betterAuthUrl: envVars.BACKEND_URL,
    frontendURL: envVars.FRONTEND_URL,
  });
});

const googleCallback = catchAsync(async (req, res) => {
  const headers = toHeaders(req.headers);

  const result = await AuthService.googleCallback(headers);

  // set cookies
  result.headers.forEach((value, key) => {
    res.setHeader(key, value);
  });

  return res.redirect(`${envVars.FRONTEND_URL}/dashboard`);
});

export const AuthController = {
  register,
  login,
  changePassword,
  logout,
  googleLogin,
  googleCallback,
};
