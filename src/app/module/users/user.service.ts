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

  const skip = (page - 1) * limit;

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
      take: limit,
    }),

    prisma.user.count({
      where: {
        isDeleted: false,
      },
    }),
  ]);

  const totalPages = Math.ceil(total / limit);

  return {
    meta: {
      page,
      limit,
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

  if (!existingUser || existingUser.isDeleted) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }
  if (!payload || Object.keys(payload).length === 0) {
    throw new AppError(status.BAD_REQUEST, "No data provided to update");
  }

  const result = await prisma.user.update({
    where: { id: user.id },
    data: {
      name: payload.name,
      phoneNumber: payload.phoneNumber,
      bio: payload.bio,
      image: payload.image,
    },
  });

  //  delete OLD image after success
  if (payload.image && existingUser?.image) {
    await deleteFileFromCloudinary(existingUser.image);
  }

  return result;
};

export const UsersService = {
  getMe,
  getAllUsers,
  updateMe,
};
