import { Role } from "../../../generated/prisma/enums";

export type RegisterPayload = {
  name: string;
  email: string;
  password: string;
  role: Role;
};

export type LoginPayload = {
  email: string;
  password: string;
};
