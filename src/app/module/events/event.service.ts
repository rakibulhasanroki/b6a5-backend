/* eslint-disable @typescript-eslint/no-explicit-any */
import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { CreateEventPayload, UpdateEventPayload } from "./event.interface";

const createEvent = async (userId: string, payload: CreateEventPayload) => {
  const existingEvent = await prisma.event.findFirst({
    where: {
      organizerId: userId,
      title: payload.title,
      startDateTime: payload.startDateTime
        ? new Date(payload.startDateTime)
        : undefined,
      isDeleted: false,
    },
  });

  if (existingEvent) {
    throw new AppError(
      status.BAD_REQUEST,
      "You already created an event with same title and start time",
    );
  }
  const event = await prisma.event.create({
    data: {
      ...payload,
      startDateTime: payload.startDateTime
        ? new Date(payload.startDateTime)
        : undefined,
      endDateTime: payload.endDateTime
        ? new Date(payload.endDateTime)
        : undefined,
      fee: payload.fee ?? 0,
      organizerId: userId,
    },
  });

  return event;
};

const getEvents = async (query: any) => {
  const {
    search,
    visibility,
    feeType,
    eventType,
    startDate,
    endDate,
    sortBy = "createdAt",
    sortOrder = "asc",
    page = 1,
    limit = 10,
  } = query;

  const where: any = {
    isDeleted: false,
  };

  if (search) {
    where.OR = [
      {
        title: {
          contains: search,
          mode: "insensitive",
        },
      },
      {
        organizer: {
          name: {
            contains: search,
            mode: "insensitive",
          },
        },
      },
    ];
  }

  if (visibility) where.visibility = visibility;
  if (eventType) where.eventType = eventType;

  if (feeType === "FREE") where.fee = 0;
  if (feeType === "PAID") where.fee = { gt: 0 };

  if (query.status === "UPCOMING") {
    where.status = "UPCOMING";
  }

  if (query.status === "ONGOING") {
    where.status = "ONGOING";
  }

  if (query.status === "ENDED") {
    where.status = "ENDED";
  }
  if (startDate || endDate) {
    where.startDateTime = {
      ...(startDate && { gte: new Date(startDate) }),
      ...(endDate && { lte: new Date(endDate) }),
    };
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where,
      include: {
        organizer: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        [sortBy]: sortOrder,
      },
      skip,
      take: Number(limit),
    }),
    prisma.event.count({ where }),
  ]);

  return {
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
    },
    data: events,
  };
};

const getMyEvents = async (userId: string, query: any) => {
  const { page = 1, limit = 10 } = query;

  const skip = (Number(page) - 1) * Number(limit);

  const [events, total] = await Promise.all([
    prisma.event.findMany({
      where: {
        organizerId: userId,
        isDeleted: false,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: Number(limit),
    }),
    prisma.event.count({
      where: {
        organizerId: userId,
        isDeleted: false,
      },
    }),
  ]);

  return {
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
    },
    data: events,
  };
};

const getSingleEvent = async (eventId: string) => {
  const event = await prisma.event.findFirst({
    where: {
      id: eventId,
      isDeleted: false,
    },
    include: {
      organizer: {
        select: {
          id: true,
          name: true,
        },
      },
      reviews: true,
    },
  });

  if (!event) {
    throw new AppError(status.NOT_FOUND, "Event not found");
  }

  return event;
};

const updateEvent = async (
  userId: string,
  eventId: string,
  payload: UpdateEventPayload,
) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event || event.isDeleted) {
    throw new AppError(status.NOT_FOUND, "Event not found");
  }

  if (event.organizerId !== userId) {
    throw new AppError(status.FORBIDDEN, "Not allowed");
  }

  const now = new Date();

  if (event.status === "ENDED") {
    throw new AppError(
      status.BAD_REQUEST,
      "Cannot update event after it has ended",
    );
  }

  if (
    payload.status === "UPCOMING" &&
    event.startDateTime &&
    now >= event.startDateTime
  ) {
    throw new AppError(
      status.BAD_REQUEST,
      "Cannot revert to UPCOMING after event has started",
    );
  }

  if (payload.status) {
    if (
      payload.status === "ONGOING" &&
      event.startDateTime &&
      now < event.startDateTime
    ) {
      throw new AppError(status.BAD_REQUEST, "Event has not started yet");
    }

    if (
      payload.status === "ENDED" &&
      event.endDateTime &&
      now < event.endDateTime
    ) {
      throw new AppError(status.BAD_REQUEST, "Event has not ended yet");
    }
  }

  if (payload.startDateTime && event.status === "ONGOING") {
    throw new AppError(
      status.BAD_REQUEST,
      "Cannot change start time once event is ongoing",
    );
  }

  if (payload.endDateTime) {
    const newEnd = new Date(payload.endDateTime);

    const effectiveStart = payload.startDateTime
      ? new Date(payload.startDateTime)
      : event.startDateTime;

    if (effectiveStart && newEnd < effectiveStart) {
      throw new AppError(
        status.BAD_REQUEST,
        "End time cannot be before start time",
      );
    }
  }

  const updated = await prisma.event.update({
    where: { id: eventId },
    data: {
      ...payload,

      ...(payload.startDateTime && {
        startDateTime: new Date(payload.startDateTime),
      }),
      ...(payload.endDateTime && {
        endDateTime: new Date(payload.endDateTime),
      }),
    },
  });

  return updated;
};

const deleteEvent = async (userId: string, eventId: string) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event || event.isDeleted) {
    throw new AppError(status.NOT_FOUND, "Event not found");
  }

  if (event.organizerId !== userId) {
    throw new AppError(status.FORBIDDEN, "Not allowed");
  }

  await prisma.event.update({
    where: { id: eventId },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
    },
  });

  return true;
};

export const EventService = {
  createEvent,
  getEvents,
  getMyEvents,
  getSingleEvent,
  updateEvent,
  deleteEvent,
};
