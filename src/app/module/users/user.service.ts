import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import status from "http-status";
import { deleteFileFromCloudinary } from "../../config/cloudinary.config";
import { IGetUsersQuery, IUpdateUserPayload } from "./users.interface";

const getMe = async (user: Express.User) => {
  return user;
};

const getAllUsers = async (query: IGetUsersQuery) => {
  const { page, limit } = query;

  const skip = (Number(page) - 1) * Number(limit);

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where: {
        isDeleted: false,
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        role: true,
        status: true,
        emailVerified: true,
        createdAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: Number(limit),
    }),

    prisma.user.count({
      where: {
        isDeleted: false,
      },
    }),
  ]);

  const totalPages = Math.ceil(total / Number(limit));

  return {
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages,
    },
    data: users,
  };
};
const updateMe = async (user: Express.User, payload: IUpdateUserPayload) => {
  const existingUser = await prisma.user.findUnique({
    where: { id: user.id },
  });

  if (
    !existingUser ||
    existingUser.isDeleted ||
    existingUser.status !== "ACTIVE"
  ) {
    throw new AppError(status.FORBIDDEN, "User not allowed");
  }
  if (!payload || Object.keys(payload).length === 0) {
    throw new AppError(status.BAD_REQUEST, "No data provided to update");
  }

  const result = await prisma.user.update({
    where: { id: user.id },
    data: {
      ...(payload.name !== undefined && { name: payload.name }),
      ...(payload.phoneNumber !== undefined && {
        phoneNumber: payload.phoneNumber,
      }),
      ...(payload.bio !== undefined && { bio: payload.bio }),
      ...(payload.image !== undefined && { image: payload.image }),
    },
  });

  if (payload.image && existingUser?.image) {
    try {
      await deleteFileFromCloudinary(existingUser.image);
    } catch (err) {
      console.error("Failed to delete old image:", err);
    }
  }

  return result;
};

const getUserStats = async (user: Express.User) => {
  const userId = user.id;
  const isAdmin = user.role === "ADMIN";

  const organizerEvents = await prisma.event.findMany({
    where: {
      organizerId: userId,
      isDeleted: false,
    },
    select: { id: true },
  });

  const organizerEventIds = organizerEvents.map((e) => e.id);

  const [
    bookingsGrouped,
    pendingInvitationsCount,
    participantPayments,
    reviewsCount,

    createdEventsCount,
    organizerBookingsGrouped,
    organizerRevenue,

    totalUsers,
    totalEvents,
    totalBookings,
    totalRevenue,
  ] = await Promise.all([
    prisma.booking.groupBy({
      by: ["status"],
      where: { userId },
      _count: { status: true },
    }),

    prisma.invitation.count({
      where: {
        invitedUserId: userId,
        status: "PENDING",
        event: {
          isDeleted: false,
        },
      },
    }),

    prisma.payment.aggregate({
      where: {
        userId,
        status: "SUCCESS",
      },
      _count: true,
      _sum: { amount: true },
    }),

    prisma.review.count({
      where: { userId },
    }),

    prisma.event.count({
      where: {
        organizerId: userId,
        isDeleted: false,
      },
    }),

    organizerEventIds.length
      ? prisma.booking.groupBy({
          by: ["status"],
          where: {
            eventId: { in: organizerEventIds },
          },
          _count: { status: true },
        })
      : Promise.resolve([]),

    organizerEventIds.length
      ? prisma.payment.aggregate({
          where: {
            eventId: { in: organizerEventIds },
            status: "SUCCESS",
          },
          _sum: { amount: true },
        })
      : Promise.resolve({ _sum: { amount: 0 } }),

    isAdmin
      ? prisma.user.count({ where: { isDeleted: false } })
      : Promise.resolve(null),

    isAdmin
      ? prisma.event.count({ where: { isDeleted: false } })
      : Promise.resolve(null),

    isAdmin ? prisma.booking.count() : Promise.resolve(null),

    isAdmin
      ? prisma.payment.aggregate({
          where: { status: "SUCCESS" },
          _sum: { amount: true },
        })
      : Promise.resolve(null),
  ]);

  const participantBookings = {
    total: 0,
    confirmed: 0,
    pending: 0,
  };

  bookingsGrouped.forEach((b) => {
    const c = b._count.status;
    participantBookings.total += c;

    if (b.status === "CONFIRMED") participantBookings.confirmed = c;
    if (b.status === "PENDING") participantBookings.pending = c;
  });

  const invitationStats = {
    pending: pendingInvitationsCount,
  };

  const organizerParticipants = {
    total: 0,
    confirmed: 0,
    pending: 0,
    banned: 0,
  };

  (organizerBookingsGrouped || []).forEach((b) => {
    const c = b._count.status;
    organizerParticipants.total += c;

    if (b.status === "CONFIRMED") organizerParticipants.confirmed = c;
    if (b.status === "PENDING") organizerParticipants.pending = c;
    if (b.status === "BANNED") organizerParticipants.banned = c;
  });

  return {
    participant: {
      eventsJoined: participantBookings.total,
      bookings: participantBookings,
      invitations: invitationStats,

      payments: {
        totalPaid: participantPayments._count || 0,
        totalAmount: participantPayments._sum.amount || 0,
      },

      reviews: {
        total: reviewsCount,
      },
    },

    organizer: {
      eventsCreated: createdEventsCount,

      participants: organizerParticipants,

      revenue: {
        totalAmount: organizerRevenue?._sum.amount || 0,
      },
    },

    ...(isAdmin && {
      admin: {
        users: { total: totalUsers || 0 },
        platform: {
          totalEvents: totalEvents || 0,
          totalBookings: totalBookings || 0,
          totalRevenue: totalRevenue?._sum.amount || 0,
        },
      },
    }),
  };
};

export const UsersService = {
  getMe,
  getAllUsers,
  updateMe,
  getUserStats,
};
