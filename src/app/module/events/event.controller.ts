import status from "http-status";
import { catchAsync } from "../../shared/catchAsync";
import { sendResponse } from "../../shared/sendResponse";
import { EventService } from "./event.service";
import AppError from "../../errorHelpers/AppError";

const createEvent = catchAsync(async (req, res) => {
  const user = req.user;
  if (!user) {
    throw new AppError(status.UNAUTHORIZED, "Unauthorized access");
  }
  const result = await EventService.createEvent(user.id, req.body);

  sendResponse(res, {
    httpStatus: status.CREATED,
    success: true,
    message: "Event created successfully",
    data: result,
  });
});

const getEvents = catchAsync(async (req, res) => {
  const result = await EventService.getEvents(req.query);

  sendResponse(res, {
    httpStatus: status.OK,
    success: true,
    message: "Events fetched successfully",
    data: result,
  });
});

const getMyEvents = catchAsync(async (req, res) => {
  const user = req.user;
  if (!user) {
    throw new AppError(status.UNAUTHORIZED, "Unauthorized access");
  }
  const result = await EventService.getMyEvents(user.id, req.query);

  sendResponse(res, {
    httpStatus: status.OK,
    success: true,
    message: "My events fetched successfully",
    data: result,
  });
});

const getSingleEvent = catchAsync(async (req, res) => {
  const id = req.params.id;
  const result = await EventService.getSingleEvent(id as string);

  sendResponse(res, {
    httpStatus: status.OK,
    success: true,
    message: "Event fetched successfully",
    data: result,
  });
});

const updateEvent = catchAsync(async (req, res) => {
  const user = req.user;
  if (!user) {
    throw new AppError(status.UNAUTHORIZED, "Unauthorized access");
  }
  const id = req.params.id;
  const result = await EventService.updateEvent(
    user.id,
    id as string,
    req.body,
  );

  sendResponse(res, {
    httpStatus: status.OK,
    success: true,
    message: "Event updated successfully",
    data: result,
  });
});

const deleteEvent = catchAsync(async (req, res) => {
  const user = req.user;
  if (!user) {
    throw new AppError(status.UNAUTHORIZED, "Unauthorized access");
  }
  const id = req.params.id;
  const result = await EventService.deleteEvent(user.id, id as string);

  sendResponse(res, {
    httpStatus: status.OK,
    success: true,
    message: "Event deleted successfully",
    data: result,
  });
});

export const EventController = {
  createEvent,
  getEvents,
  getMyEvents,
  getSingleEvent,
  updateEvent,
  deleteEvent,
};
