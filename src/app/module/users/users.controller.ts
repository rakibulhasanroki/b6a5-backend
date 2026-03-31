import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { UsersService } from "./user.service";

const getMe = catchAsync(async (req, res) => {
  const user = req.user;

  const result = await UsersService.getMe(user as Express.User);

  sendResponse(res, {
    httpStatus: status.OK,
    success: true,
    message: "User fetched successfully",
    data: result,
  });
});

export const UsersController = {
  getMe,
};
