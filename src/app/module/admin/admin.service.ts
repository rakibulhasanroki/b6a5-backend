import status from "http-status";
import AppError from "../../errorHelpers/AppError";
import { auth } from "../../lib/auth";
import { prisma } from "../../lib/prisma";
import { CreateAdminPayload } from "./admin.interface";

const createAdmin = async (payload: CreateAdminPayload) => {
  const { name, email, password } = payload;

  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser && !existingUser.isDeleted) {
    throw new AppError(status.BAD_REQUEST, "User already exists");
  }

  const data = await auth.api.signUpEmail({
    body: {
      name,
      email,
      password,
    },
  });

  if (!data.user) {
    throw new AppError(status.BAD_REQUEST, "Admin creation failed");
  }

  await prisma.user.update({
    where: { id: data.user.id },
    data: {
      role: "ADMIN",
      emailVerified: true,
    },
  });

  return data.user;
};

const deleteUser = async (userId: string, currentUserId: string) => {
  if (userId === currentUserId) {
    throw new AppError(status.BAD_REQUEST, "You cannot delete yourself");
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user || user.isDeleted) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  await prisma.$transaction([
    // 1. mark as deleted
    prisma.user.update({
      where: { id: userId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
        status: "INACTIVE",
      },
    }),

    prisma.session.deleteMany({
      where: { userId },
    }),
  ]);

  return true;
};

const deleteEvent = async (eventId: string) => {
  const event = await prisma.event.findUnique({
    where: { id: eventId },
  });

  if (!event || event.isDeleted) {
    throw new AppError(status.NOT_FOUND, "Event not found");
  }

  await prisma.event.update({
    where: { id: eventId },
    data: {
      isDeleted: true,
    },
  });

  return true;
};

export const AdminService = {
  createAdmin,
  deleteUser,
  deleteEvent,
};
