/* eslint-disable @typescript-eslint/no-explicit-any */
import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { prisma } from "../../lib/prisma";
import { CreateReviewPayload, UpdateReviewPayload } from "./review.interface";

const createReview = async (userId: string, payload: CreateReviewPayload) => {
  const { eventId, rating, comment } = payload;

  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event || event.isDeleted) {
    throw new AppError(status.NOT_FOUND, "Event not found");
  }

  const now = new Date();

  if (!event.endDateTime || now < event.endDateTime) {
    throw new AppError(status.BAD_REQUEST, "Cannot review before event ends");
  }

  const booking = await prisma.booking.findUnique({
    where: {
      userId_eventId: { userId, eventId },
    },
  });

  if (!booking || booking.status !== "CONFIRMED") {
    throw new AppError(
      status.FORBIDDEN,
      "You are not allowed to review this event",
    );
  }

  const existingReview = await prisma.review.findUnique({
    where: {
      userId_eventId: { userId, eventId },
    },
  });

  if (existingReview) {
    throw new AppError(status.BAD_REQUEST, "You already reviewed this event");
  }

  const editableUntil = new Date(
    new Date(event.endDateTime!).getTime() + 48 * 60 * 60 * 1000,
  );

  return prisma.review.create({
    data: {
      userId,
      eventId,
      rating,
      comment,
      editableUntil,
    },
  });
};

const updateReview = async (
  userId: string,
  reviewId: string,
  payload: UpdateReviewPayload,
) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new AppError(status.NOT_FOUND, "Review not found");
  }

  if (review.userId !== userId) {
    throw new AppError(status.FORBIDDEN, "Not allowed");
  }

  if (new Date() > review.editableUntil) {
    throw new AppError(status.BAD_REQUEST, "Edit time expired");
  }

  return prisma.review.update({
    where: { id: reviewId },
    data: payload,
  });
};

const deleteReview = async (userId: string, reviewId: string) => {
  const review = await prisma.review.findUnique({
    where: { id: reviewId },
  });

  if (!review) {
    throw new AppError(status.NOT_FOUND, "Review not found");
  }

  if (review.userId !== userId) {
    throw new AppError(status.FORBIDDEN, "Not allowed");
  }

  if (new Date() > review.editableUntil) {
    throw new AppError(status.BAD_REQUEST, "Delete time expired");
  }

  await prisma.review.delete({
    where: { id: reviewId },
  });

  return true;
};

const getEventReviews = async (eventId: string, query: any) => {
  const { page = 1, limit = 10 } = query;

  const skip = (Number(page) - 1) * Number(limit);

  const [reviews, total, stats] = await Promise.all([
    prisma.review.findMany({
      where: {
        eventId,
        event: {
          isDeleted: false,
        },
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip,
      take: Number(limit),
    }),
    prisma.review.count({
      where: { eventId },
    }),
    prisma.review.aggregate({
      where: { eventId },
      _avg: { rating: true },
      _count: { rating: true },
    }),
  ]);

  return {
    meta: {
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / limit),
    },
    stats: {
      averageRating: stats._avg.rating || 0,
      totalReviews: stats._count.rating,
    },
    data: reviews,
  };
};

const getMyReviews = async (userId: string) => {
  return prisma.review.findMany({
    where: { userId },
    include: {
      event: true,
    },

    orderBy: {
      createdAt: "desc",
    },
  });
};

const getMyEventReview = async (userId: string, eventId: string) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event || event.isDeleted) {
    throw new AppError(status.NOT_FOUND, "Event not found");
  }

  const booking = await prisma.booking.findUnique({
    where: {
      userId_eventId: { userId, eventId },
    },
  });

  if (!booking) {
    throw new AppError(
      status.FORBIDDEN,
      "You are not allowed to access this review",
    );
  }

  const review = await prisma.review.findUnique({
    where: {
      userId_eventId: { userId, eventId },
    },
  });

  return review || null;
};

export const ReviewService = {
  createReview,
  updateReview,
  deleteReview,
  getEventReviews,
  getMyReviews,
  getMyEventReview,
};
