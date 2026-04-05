import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { InvitationStatus } from "../../../generated/prisma/enums";

const sendInvitation = async (
  userId: string,
  eventId: string,
  invitedUserId: string,
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

  if (userId === invitedUserId) {
    throw new AppError(status.BAD_REQUEST, "Cannot invite yourself");
  }

  const existing = await prisma.invitation.findUnique({
    where: {
      eventId_invitedUserId: {
        eventId,
        invitedUserId,
      },
    },
  });

  if (existing) {
    throw new AppError(status.BAD_REQUEST, "User already invited");
  }
  const existingBooking = await prisma.booking.findUnique({
    where: {
      userId_eventId: {
        userId: invitedUserId,
        eventId,
      },
    },
  });

  if (existingBooking) {
    throw new AppError(status.BAD_REQUEST, "User already joined this event");
  }

  return prisma.invitation.create({
    data: {
      eventId,
      invitedUserId,
      status: InvitationStatus.PENDING,
    },
  });
};

const getMyInvitations = async (userId: string) => {
  return prisma.invitation.findMany({
    where: {
      invitedUserId: userId,
      event: {
        isDeleted: false,
      },
    },
    include: {
      event: {
        select: {
          id: true,
          title: true,
          fee: true,
          visibility: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });
};

const getEventInvitations = async (userId: string, eventId: string) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event || event.isDeleted) {
    throw new AppError(status.NOT_FOUND, "Event not found");
  }

  if (event.organizerId !== userId) {
    throw new AppError(status.FORBIDDEN, "Not allowed");
  }

  return prisma.invitation.findMany({
    where: {
      eventId,
    },
    include: {
      invitedUser: {
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
};

const updateInvitationStatus = async (
  userId: string,
  invitationId: string,
  statusValue: InvitationStatus,
) => {
  const invitation = await prisma.invitation.findUnique({
    where: { id: invitationId },
  });

  if (!invitation) {
    throw new AppError(status.NOT_FOUND, "Invitation not found");
  }

  if (invitation.invitedUserId !== userId) {
    throw new AppError(status.FORBIDDEN, "Not allowed");
  }

  if (invitation.status !== InvitationStatus.PENDING) {
    throw new AppError(status.BAD_REQUEST, "Invitation already responded");
  }

  if (statusValue != InvitationStatus.DECLINED) {
    throw new AppError(status.BAD_REQUEST, "Only Decline is allowed");
  }

  return prisma.invitation.update({
    where: { id: invitationId },
    data: {
      status: statusValue,
    },
  });
};

export const InvitationService = {
  sendInvitation,
  getMyInvitations,
  getEventInvitations,
  updateInvitationStatus,
};
