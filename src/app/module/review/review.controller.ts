import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import AppError from "../../errorHelpers/AppError";
import { ReviewService } from "./review.service";

const createReview = catchAsync(async (req, res) => {
  const user = req.user;
  if (!user) throw new AppError(status.UNAUTHORIZED, "Unauthorized");

  const result = await ReviewService.createReview(user.id, req.body);

  sendResponse(res, {
    httpStatus: status.CREATED,
    success: true,
    message: "Review created successfully",
    data: result,
  });
});

const updateReview = catchAsync(async (req, res) => {
  const user = req.user;
  if (!user) throw new AppError(status.UNAUTHORIZED, "Unauthorized");

  const result = await ReviewService.updateReview(
    user.id,
    req.params.reviewId as string,
    req.body,
  );

  sendResponse(res, {
    httpStatus: status.OK,
    success: true,
    message: "Review updated successfully",
    data: result,
  });
});

const deleteReview = catchAsync(async (req, res) => {
  const user = req.user;
  if (!user) throw new AppError(status.UNAUTHORIZED, "Unauthorized");

  await ReviewService.deleteReview(user.id, req.params.reviewId as string);

  sendResponse(res, {
    httpStatus: status.OK,
    success: true,
    message: "Review deleted successfully",
    data: null,
  });
});

const getEventReviews = catchAsync(async (req, res) => {
  const { eventId } = req.params;
  const result = await ReviewService.getEventReviews(
    eventId as string,
    req.query,
  );

  sendResponse(res, {
    httpStatus: status.OK,
    success: true,
    message: "Reviews fetched successfully",
    data: result,
  });
});

const getMyReviews = catchAsync(async (req, res) => {
  const user = req.user;
  if (!user) throw new AppError(status.UNAUTHORIZED, "Unauthorized");

  const result = await ReviewService.getMyReviews(user.id);

  sendResponse(res, {
    httpStatus: status.OK,
    success: true,
    message: "My reviews fetched successfully",
    data: result,
  });
});

const getMyEventReview = catchAsync(async (req, res) => {
  const user = req.user;
  if (!user) throw new AppError(status.UNAUTHORIZED, "Unauthorized");

  const { eventId } = req.params;

  const result = await ReviewService.getMyEventReview(
    user.id,
    eventId as string,
  );

  sendResponse(res, {
    httpStatus: status.OK,
    success: true,
    message: "My event review fetched successfully",
    data: result,
  });
});

export const ReviewController = {
  createReview,
  updateReview,
  deleteReview,
  getEventReviews,
  getMyReviews,
  getMyEventReview,
};
