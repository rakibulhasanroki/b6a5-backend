import { Role, UserStatus } from "../generated/prisma/enums";

declare global {
  namespace Express {
    interface User {
      id: string;
      name: string;
      email: string;
      role: Role;
      status: UserStatus;
      isDeleted: boolean;
    }

    interface Request {
      user?: User;
    }
  }
}

export {};
