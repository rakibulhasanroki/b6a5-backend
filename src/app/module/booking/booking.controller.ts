import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { BookingService } from "./booking.service";

const createBooking = catchAsync(async (req, res) => {
  const user = req.user!;
  const result = await BookingService.createBooking(user.id, req.body);

  sendResponse(res, {
    httpStatus: status.CREATED,
    success: true,
    message: "Booking created successfully",
    data: result,
  });
});

const getMyBookings = catchAsync(async (req, res) => {
  const user = req.user!;
  const result = await BookingService.getMyBookings(user.id);

  sendResponse(res, {
    httpStatus: status.OK,
    success: true,
    message: "Bookings fetched successfully",
    data: result,
  });
});

const getBookingById = catchAsync(async (req, res) => {
  const user = req.user!;
  const { id } = req.params;

  const result = await BookingService.getBookingById(user.id, id as string);

  sendResponse(res, {
    httpStatus: status.OK,
    success: true,
    message: "Booking fetched successfully",
    data: result,
  });
});

const updateBookingStatus = catchAsync(async (req, res) => {
  const user = req.user!;
  const { id } = req.params;

  const result = await BookingService.updateBookingStatus(
    user.id,
    id as string,
    req.body,
  );

  sendResponse(res, {
    httpStatus: status.OK,
    success: true,
    message: "Booking status updated",
    data: result,
  });
});

export const BookingController = {
  createBooking,
  getMyBookings,
  getBookingById,
  updateBookingStatus,
};
