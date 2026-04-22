/* eslint-disable @typescript-eslint/no-explicit-any */
import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import {
  CreateEventPayload,
  IGetEventsQuery,
  UpdateEventPayload,
} from "./event.interface";
import { BookingStatus } from "../../../generated/prisma/enums";
import { getEventStatus } from "./event.utils";

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

  return {
    ...event,
    status: getEventStatus(event.startDateTime, event.endDateTime),
  };
};

const getEvents = async (query: IGetEventsQuery) => {
  const {
    search,
    visibility,
    feeType,
    eventType,
    startDate,
    endDate,
    sortBy = "createdAt",
    sortOrder = "desc",
    status,
    page = 1,
    limit = 10,
  } = query;

  const where: any = {
    isDeleted: false,
    organizer: {
      isDeleted: false,
      status: "ACTIVE",
    },
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

  const now = new Date();

  if (status === "UPCOMING") {
    where.AND = [...(where.AND || []), { startDateTime: { gt: now } }];
  }

  if (status === "ONGOING") {
    where.AND = [
      ...(where.AND || []),
      { startDateTime: { lte: now } },
      { endDateTime: { gte: now } },
    ];
  }

  if (status === "ENDED") {
    where.AND = [...(where.AND || []), { endDateTime: { lt: now } }];
  }

  if (startDate || endDate) {
    where.AND = [
      ...(where.AND || []),
      {
        startDateTime: {
          ...(startDate && { gte: new Date(startDate) }),
          ...(endDate && { lte: new Date(endDate) }),
        },
      },
    ];
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

  const eventIds = events.map((e) => e.id);

  const bookingCounts = await prisma.booking.groupBy({
    by: ["eventId"],
    where: {
      eventId: { in: eventIds },
      status: {
        notIn: [BookingStatus.CANCELLED, BookingStatus.BANNED],
      },
    },
    _count: {
      eventId: true,
    },
  });

  const countMap = new Map(
    bookingCounts.map((b) => [b.eventId, b._count.eventId]),
  );

  const enrichedEvents = events.map((event) => {
    const currentParticipants = countMap.get(event.id) || 0;
    const max = event.maxParticipants;

    const isFull = max ? currentParticipants >= max : false;
    const spotsLeft = max ? Math.max(max - currentParticipants, 0) : null;

    return {
      ...event,
      status: getEventStatus(event.startDateTime, event.endDateTime),

      currentParticipants,
      isFull,
      spotsLeft,
    };
  });

  return {
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
    data: enrichedEvents,
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
  const eventIds = events.map((e) => e.id);

  const bookingCounts = await prisma.booking.groupBy({
    by: ["eventId"],
    where: {
      eventId: { in: eventIds },
      status: {
        notIn: [BookingStatus.CANCELLED, BookingStatus.BANNED],
      },
    },
    _count: {
      eventId: true,
    },
  });

  const countMap = new Map(
    bookingCounts.map((b) => [b.eventId, b._count.eventId]),
  );

  const enrichedEvents = events.map((event) => {
    const currentParticipants = countMap.get(event.id) || 0;
    const max = event.maxParticipants;

    const isFull = max ? currentParticipants >= max : false;
    const spotsLeft = max ? Math.max(max - currentParticipants, 0) : null;

    return {
      ...event,
      status: getEventStatus(event.startDateTime, event.endDateTime),
      currentParticipants,
      isFull,
      spotsLeft,
    };
  });

  return {
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
    data: enrichedEvents,
  };
};

const getSingleEvent = async (eventId: string, userId?: string) => {
  const event = await prisma.event.findFirst({
    where: {
      id: eventId,
      isDeleted: false,
      organizer: {
        isDeleted: false,
        status: "ACTIVE",
      },
    },
    include: {
      organizer: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  if (!event) {
    throw new AppError(status.NOT_FOUND, "Event not found");
  }

  const currentParticipants = await prisma.booking.count({
    where: {
      eventId,
      status: {
        notIn: [BookingStatus.CANCELLED, BookingStatus.BANNED],
      },
    },
  });

  const max = event.maxParticipants;

  const isFull = max ? currentParticipants >= max : false;
  const spotsLeft = max ? Math.max(max - currentParticipants, 0) : null;

  let isParticipant = false;

  if (userId) {
    const booking = await prisma.booking.findFirst({
      where: {
        userId,
        eventId,
      },
      select: { id: true },
    });

    isParticipant = !!booking;
  }

  return {
    ...event,
    status: getEventStatus(event.startDateTime, event.endDateTime),
    isParticipant,

    currentParticipants,
    isFull,
    spotsLeft,
  };
};
const getAllParticipants = async (userId: string) => {
  const events = await prisma.event.findMany({
    where: {
      organizerId: userId,
      isDeleted: false,
    },
    select: {
      id: true,
    },
  });

  const eventIds = events.map((e) => e.id);

  if (!eventIds.length) return [];

  const bookings = await prisma.booking.findMany({
    where: {
      eventId: {
        in: eventIds,
      },
      status: {
        notIn: [BookingStatus.CANCELLED, BookingStatus.BANNED],
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  const uniqueMap = new Map();

  for (const booking of bookings) {
    if (!uniqueMap.has(booking.userId)) {
      uniqueMap.set(booking.userId, {
        ...booking.user,
      });
    }
  }

  return Array.from(uniqueMap.values());
};

const getEventRequests = async (userId: string, eventId: string) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event || event.isDeleted) {
    throw new AppError(status.NOT_FOUND, "Event not found");
  }

  if (event.organizerId !== userId) {
    throw new AppError(status.FORBIDDEN, "Not allowed");
  }

  const requests = await prisma.booking.findMany({
    where: {
      eventId,
      status: BookingStatus.PENDING,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return requests;
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

  const currentStatus = getEventStatus(event.startDateTime, event.endDateTime);

  if (currentStatus === "ENDED") {
    throw new AppError(
      status.BAD_REQUEST,
      "Cannot update event after it has ended",
    );
  }

  if (payload.status === "UPCOMING" && currentStatus !== "UPCOMING") {
    throw new AppError(status.BAD_REQUEST, "Cannot revert to UPCOMING");
  }

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

  if (payload.startDateTime && currentStatus !== "UPCOMING") {
    throw new AppError(
      status.BAD_REQUEST,
      "Cannot change start time after event has started",
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

  const finalEventType = payload.eventType ?? event.eventType;

  const finalLocation =
    payload.location !== undefined ? payload.location : event.location;

  const finalMeetingLink =
    payload.meetingLink !== undefined ? payload.meetingLink : event.meetingLink;

  if (finalEventType === "PHYSICAL" && !finalLocation) {
    throw new AppError(
      status.BAD_REQUEST,
      "Location is required for PHYSICAL event",
    );
  }

  if (finalEventType === "ONLINE" && !finalMeetingLink) {
    throw new AppError(
      status.BAD_REQUEST,
      "Meeting link is required for ONLINE event",
    );
  }
  const { status: _status, ...rest } = payload;
  void _status;
  const updated = await prisma.event.update({
    where: { id: eventId },
    data: {
      ...rest,

      ...(payload.startDateTime && {
        startDateTime: new Date(payload.startDateTime),
      }),
      ...(payload.endDateTime && {
        endDateTime: new Date(payload.endDateTime),
      }),
    },
  });

  return {
    ...updated,
    status: getEventStatus(updated.startDateTime, updated.endDateTime),
  };
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

  const eventStatus = getEventStatus(event.startDateTime, event.endDateTime);

  if (eventStatus !== "UPCOMING") {
    throw new AppError(
      status.BAD_REQUEST,
      "Only upcoming events can be deleted",
    );
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

const getJoinedEvents = async (userId: string, query: any) => {
  const { page = 1, limit = 10 } = query;

  const skip = (Number(page) - 1) * Number(limit);

  const [bookings, total] = await Promise.all([
    prisma.booking.findMany({
      where: {
        userId,
        event: {
          isDeleted: false,
        },
      },
      include: {
        event: {
          include: {
            organizer: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: Number(limit),
    }),

    prisma.booking.count({
      where: {
        userId,
        event: {
          isDeleted: false,
        },
      },
    }),
  ]);

  const eventIds = bookings.map((b) => b.event.id);

  const bookingCounts = await prisma.booking.groupBy({
    by: ["eventId"],
    where: {
      eventId: { in: eventIds },
      status: {
        notIn: [BookingStatus.CANCELLED, BookingStatus.BANNED],
      },
    },
    _count: {
      eventId: true,
    },
  });

  const countMap = new Map(
    bookingCounts.map((b) => [b.eventId, b._count.eventId]),
  );

  return {
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    },
    data: bookings.map((b) => {
      const currentParticipants = countMap.get(b.event.id) || 0;
      const max = b.event.maxParticipants;

      const isFull = max ? currentParticipants >= max : false;
      const spotsLeft = max ? Math.max(max - currentParticipants, 0) : null;

      return {
        ...b.event,
        status: getEventStatus(b.event.startDateTime, b.event.endDateTime),
        bookingStatus: b.status,
        currentParticipants,
        isFull,
        spotsLeft,
      };
    }),
  };
};

export const EventService = {
  createEvent,
  getEvents,
  getMyEvents,
  getSingleEvent,
  getAllParticipants,
  getEventRequests,
  updateEvent,
  deleteEvent,
  getJoinedEvents,
};
