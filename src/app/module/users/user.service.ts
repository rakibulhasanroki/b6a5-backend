import { prisma } from "../../lib/prisma";
import AppError from "../../errorHelpers/AppError";
import status from "http-status";
import { deleteFileFromCloudinary } from "../../config/cloudinary.config";
import { IUpdateUserPayload } from "./users.interface";

const getMe = async (user: Express.User) => {
  if (!user) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }
  return user;
};

const updateMe = async (user: Express.User, payload: IUpdateUserPayload) => {
  if (!user) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  const existingUser = await prisma.user.findUnique({
    where: { id: user.id },
  });

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
  updateMe,
};
