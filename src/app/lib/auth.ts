import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import { envVars } from "../config/env";
import { allowedORigin } from "../config";

export const auth = betterAuth({
  baseURL: envVars.BETTER_AUTH_URL!,
  secret: envVars.BETTER_AUTH_SECRET!,
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  trustedOrigins: allowedORigin,
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false,
  },
  socialProviders: {
    google: {
      redirectURI: `${envVars.FRONTEND_URL}/api/auth/callback/google`,
      prompt: "select_account",
      clientId: envVars.GOOGLE.CLIENT_ID!,
      clientSecret: envVars.GOOGLE.CLIENT_SECRET!,
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "USER",
        required: false,
      },
      bio: {
        type: "string",
        required: false,
      },
      emailVerified: {
        type: "boolean",
        defaultValue: false,
        required: false,
      },
      status: {
        type: "string",
        defaultValue: "ACTIVE",
        required: false,
      },
      phoneNumber: {
        type: "string",
        required: false,
      },
      isDeleted: {
        type: "boolean",
        defaultValue: false,
        required: false,
      },
      deletedAt: {
        type: "date",
        required: false,
      },
    },
  },
  advanced: {
    cookiePrefix: "better-auth",
    useSecureCookies: envVars.NODE_ENV === "production",
    defaultCookieAttributes: {
      secure: envVars.NODE_ENV === "production",
      sameSite: envVars.NODE_ENV === "production" ? "none" : "lax",
      httpOnly: envVars.NODE_ENV === "production",
    },
  },
});
