import { prisma } from "../lib/prisma";
import { auth } from "../lib/auth";
import { envVars } from "../config/env";

export const seedAdmin = async () => {
  try {
    console.log(" Admin seeding started...");

    const email = envVars.ADMIN.EMAIL as string;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log(" Admin already exists, skipping...");
      return;
    }

    const result = await auth.api.signUpEmail({
      body: {
        name: envVars.ADMIN.NAME as string,
        email,
        password: envVars.ADMIN.PASSWORD as string,
      },
    });

    if (!result.user) {
      throw new Error("Failed to create admin");
    }

    await prisma.user.update({
      where: { id: result.user.id },
      data: {
        role: "ADMIN",
        emailVerified: true,
      },
    });

    console.log(" Admin created successfully");
  } catch (error) {
    console.error("Admin seeding failed", error);
  }
};
