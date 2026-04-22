import { NextFunction, Request, Response } from "express";
import { Role, UserStatus } from "../../generated/prisma/enums";
import { auth } from "../lib/auth";
import { toHeaders } from "../utils/toHeaders";
import { prisma } from "../lib/prisma";

const optionalAuth =
  (...roles: Role[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const session = await auth.api.getSession({
        headers: toHeaders(req.headers),
      });

      if (!session?.user) return next();

      const user = await prisma.user.findUnique({
        where: { id: session.user.id },
      });

      if (!user) return next();

      if (user.status === UserStatus.INACTIVE || user.isDeleted) {
        return next();
      }

      if (roles.length && !roles.includes(user.role)) {
        return next();
      }

      req.user = user;

      next();
    } catch {
      next();
    }
  };

export default optionalAuth;
