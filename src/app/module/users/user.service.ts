import status from "http-status";
import AppError from "../../errorHelpers/AppError";

const getMe = async (user: Express.User) => {
  if (!user) {
    throw new AppError(status.NOT_FOUND, "User not found");
  }

  return user;
};

export const UsersService = {
  getMe,
};
