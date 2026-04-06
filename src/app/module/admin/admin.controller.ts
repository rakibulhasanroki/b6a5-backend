import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { AdminService } from "./admin.service";

const createAdmin = catchAsync(async (req, res) => {
  const result = await AdminService.createAdmin(req.body);

  sendResponse(res, {
    httpStatus: status.CREATED,
    success: true,
    message: "Admin created successfully",
    data: result,
  });
});

const deleteUser = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const user = req.user!;

  await AdminService.deleteUser(userId as string, user.id);

  sendResponse(res, {
    httpStatus: status.OK,
    success: true,
    message: "User deleted successfully",
  });
});

const deleteEvent = catchAsync(async (req, res) => {
  const { eventId } = req.params;

  await AdminService.deleteEvent(eventId as string);

  sendResponse(res, {
    httpStatus: status.OK,
    success: true,
    message: "Event deleted successfully",
  });
});

export const AdminController = {
  createAdmin,
  deleteUser,
  deleteEvent,
};
