import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { UsersService } from "./user.service";
import { IGetUsersQuery } from "./users.interface";

const getMe = catchAsync(async (req, res) => {
  const result = await UsersService.getMe(req.user as Express.User);

  sendResponse(res, {
    httpStatus: status.OK,
    success: true,
    message: "User fetched successfully",
    data: result,
  });
});

const getAllUsers = catchAsync(async (req, res) => {
  const result = await UsersService.getAllUsers(
    req.query as unknown as IGetUsersQuery,
  );

  sendResponse(res, {
    httpStatus: status.OK,
    success: true,
    message: "Users fetched successfully",
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
  getAllUsers,
  updateMe,
};
