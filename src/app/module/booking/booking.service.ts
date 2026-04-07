import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import {
  CreateBookingPayload,
  UpdateBookingStatusPayload,
} from "./booking.interface";
import {
  BookingStatus,
  EventStatus,
  InvitationStatus,
  Visibility,
} from "../../../generated/prisma/enums";
import { PaymentService } from "../payment/payment.service";

const createBooking = async (userId: string, payload: CreateBookingPayload) => {
  const { eventId, invitationId } = payload;

  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event || event.isDeleted) {
    throw new AppError(status.NOT_FOUND, "Event not found");
  }
  if (event.organizerId === userId) {
    throw new AppError(
      status.BAD_REQUEST,
      "Organizer cannot join their own event",
    );
  }
  if (event.status === EventStatus.ENDED) {
    throw new AppError(status.BAD_REQUEST, "Event has already ended");
  }

  if (event.status === EventStatus.ONGOING) {
    throw new AppError(status.BAD_REQUEST, "Event already started");
  }

  const now = new Date();

  if (event.endDateTime && now > event.endDateTime) {
    throw new AppError(status.BAD_REQUEST, "Event has already ended");
  }

  if (event.startDateTime && now >= event.startDateTime) {
    throw new AppError(status.BAD_REQUEST, "Event already started");
  }

  const existingBooking = await prisma.booking.findUnique({
    where: {
      userId_eventId: {
        userId,
        eventId,
      },
    },
  });

  if (existingBooking) {
    if (existingBooking.status === BookingStatus.BANNED) {
      throw new AppError(status.FORBIDDEN, "You are banned from this event");
    }

    throw new AppError(status.BAD_REQUEST, "You already joined this event");
  }

  return prisma.$transaction(async (tx) => {
    let invitation = null;

    if (invitationId) {
      invitation = await tx.invitation.findUnique({
        where: { id: invitationId },
      });

      if (!invitation) {
        throw new AppError(status.NOT_FOUND, "Invitation not found");
      }

      if (invitation.eventId !== eventId) {
        throw new AppError(
          status.BAD_REQUEST,
          "Invitation does not match event",
        );
      }

      if (invitation.invitedUserId !== userId) {
        throw new AppError(status.FORBIDDEN, "Not allowed");
      }

      if (invitation.status !== InvitationStatus.PENDING) {
        throw new AppError(status.BAD_REQUEST, "Invitation already used");
      }
    }

    if (event.maxParticipants) {
      const count = await tx.booking.count({
        where: {
          eventId,
          status: {
            in: [BookingStatus.PENDING, BookingStatus.CONFIRMED],
          },
        },
      });

      if (count >= event.maxParticipants) {
        throw new AppError(status.BAD_REQUEST, "Event is full");
      }
    }

    if (event.fee > 0) {
      const paymentSession = await PaymentService.createCheckoutSession({
        userId,
        event,
        invitationId,
      });

      return {
        requiresPayment: true,
        paymentUrl: paymentSession.paymentUrl,
      };
    }

    const bookingStatus =
      event.visibility === Visibility.PUBLIC
        ? BookingStatus.CONFIRMED
        : BookingStatus.PENDING;

    const booking = await tx.booking.create({
      data: {
        userId,
        eventId,
        status: bookingStatus,
      },
    });

    if (invitation && invitation.status === InvitationStatus.PENDING) {
      await tx.invitation.update({
        where: { id: invitation.id },
        data: {
          status: InvitationStatus.ACCEPTED,
        },
      });
    }

    return booking;
  });
};

const getMyBookings = async (userId: string) => {
  return prisma.booking.findMany({
    where: {
      userId,
      event: {
        isDeleted: false,
      },
    },

    include: {
      event: true,
      payment: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

const getBookingById = async (userId: string, bookingId: string) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      event: true,
      payment: true,
    },
  });

  if (!booking || booking.event.isDeleted) {
    throw new AppError(status.NOT_FOUND, "Booking not found");
  }

  if (booking.userId !== userId && booking.event.organizerId !== userId) {
    throw new AppError(status.FORBIDDEN, "Forbidden");
  }

  return booking;
};

const updateBookingStatus = async (
  userId: string,
  bookingId: string,
  payload: UpdateBookingStatusPayload,
) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: { event: true },
  });

  if (!booking) {
    throw new AppError(status.NOT_FOUND, "Booking not found");
  }
  if (booking.event.isDeleted) {
    throw new AppError(status.NOT_FOUND, "Event not found");
  }

  if (
    booking.status === BookingStatus.BANNED ||
    (booking.status === BookingStatus.CANCELLED && booking.userId === userId)
  ) {
    throw new AppError(status.BAD_REQUEST, "Cannot modify this booking");
  }

  const isOrganizer = booking.event.organizerId === userId;
  const isParticipant = booking.userId === userId;

  if (!isOrganizer && !isParticipant) {
    throw new AppError(status.FORBIDDEN, "Not allowed");
  }
  const isOngoing = booking.event.status === EventStatus.ONGOING;
  if (isParticipant && !isOrganizer) {
    if (payload.status !== BookingStatus.CANCELLED) {
      throw new AppError(status.FORBIDDEN, "You can only cancel your booking");
    }

    if (isOngoing) {
      throw new AppError(
        status.BAD_REQUEST,
        "Cannot cancel booking after event started",
      );
    }
  }

  if (isOrganizer) {
    if (
      payload.status !== BookingStatus.CONFIRMED &&
      payload.status !== BookingStatus.CANCELLED &&
      payload.status !== BookingStatus.BANNED
    ) {
      throw new AppError(
        status.BAD_REQUEST,
        "Organizer can only confirm, cancel or ban",
      );
    }

    if (isOngoing && payload.status === BookingStatus.CANCELLED) {
      throw new AppError(
        status.BAD_REQUEST,
        "Cannot cancel booking after event started",
      );
    }
  }

  return prisma.booking.update({
    where: { id: bookingId },
    data: {
      status: payload.status,
    },
  });
};

const getEventBookings = async (userId: string, eventId: string) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event || event.isDeleted) {
    throw new AppError(status.NOT_FOUND, "Event not found");
  }

  if (event.organizerId !== userId) {
    throw new AppError(status.FORBIDDEN, "Not allowed");
  }

  return prisma.booking.findMany({
    where: { eventId },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });
};

export const BookingService = {
  createBooking,
  getMyBookings,
  getBookingById,
  updateBookingStatus,
  getEventBookings,
};
