import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { AuthService } from "./auth.service";
import { toHeaders } from "../../utils/toHeaders";

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

export const AuthController = {
  register,
  login,
};
