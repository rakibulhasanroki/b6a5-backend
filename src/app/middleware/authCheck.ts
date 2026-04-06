import { NextFunction, Request, Response } from "express";
import { prisma } from "../lib/prisma";
import { Role, UserStatus } from "../../generated/prisma/enums";
import { auth } from "../lib/auth";
import AppError from "../errorHelpers/AppError";
import status from "http-status";
import { toHeaders } from "../utils/toHeaders";

const authCheck =
  (...roles: Role[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const session = await auth.api.getSession({
        headers: toHeaders(req.headers),
      });

      if (!session?.user) {
        throw new AppError(status.UNAUTHORIZED, "Unauthorized access");
      }

      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
      });

      if (!user) {
        throw new AppError(status.NOT_FOUND, "User not found");
      }

      if (user.status === UserStatus.BANNED || user.isDeleted) {
        throw new AppError(status.FORBIDDEN, "User is banned or deleted");
      }

      if (roles.length && !roles.includes(user.role)) {
        throw new AppError(
          status.FORBIDDEN,
          "Forbidden! You don't have access",
        );
      }

      req.user = user;

      next();
    } catch (error) {
      next(error);
    }
  };

export default authCheck;
