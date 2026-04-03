import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { UsersService } from "./user.service";

const getMe = catchAsync(async (req, res) => {
  const result = await UsersService.getMe(req.user as Express.User);

  sendResponse(res, {
    httpStatus: status.OK,
    success: true,
    message: "User fetched successfully",
    data: result,
  });
});

const updateMe = catchAsync(async (req, res) => {
  const result = await UsersService.updateMe(
    req.user as Express.User,
    req.body,
  );

  sendResponse(res, {
    httpStatus: status.OK,
    success: true,
    message: "Profile updated successfully",
    data: result,
  });
});

export const UsersController = {
  getMe,
  updateMe,
};
