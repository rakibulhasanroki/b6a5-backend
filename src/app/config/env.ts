import dotenv from "dotenv";

dotenv.config();

interface EnvConfig {
  NODE_ENV: string;
  PORT?: string;
  DATABASE_URL: string;
  BETTER_AUTH_URL: string;
  BETTER_AUTH_SECRET: string;
  CLOUDINARY: {
    CLOUD_NAME: string;
    API_KEY: string;
    API_SECRET: string;
  };
  STRIPE: {
    SECRET_KEY: string;
    WEBHOOK_SECRET: string;
  };
  FRONTEND_URL: string;
  BACKEND_URL: string;
  GOOGLE: {
    CLIENT_ID: string;
    CLIENT_SECRET: string;
  };
  ADMIN: {
    NAME?: string;
    EMAIL?: string;
    PASSWORD?: string;
  };
}

const loadEnv = (): EnvConfig => {
  const requiredEnvVars = [
    "NODE_ENV",
    "DATABASE_URL",
    "BETTER_AUTH_URL",
    "BETTER_AUTH_SECRET",
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
    "STRIPE_SECRET_KEY",
    "STRIPE_WEBHOOK_SECRET",
    "FRONTEND_URL",
    "BACKEND_URL",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
  ];

  for (const varName of requiredEnvVars) {
    if (!process.env[varName]) {
      throw new Error(
        `Environment variable ${varName} is required but not defined.`,
      );
    }
  }

  return {
    NODE_ENV: process.env.NODE_ENV as string,
    PORT: process.env.PORT || "5000",
    DATABASE_URL: process.env.DATABASE_URL as string,
    BETTER_AUTH_URL: process.env.BETTER_AUTH_URL as string,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET as string,
    CLOUDINARY: {
      CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME as string,
      API_KEY: process.env.CLOUDINARY_API_KEY as string,
      API_SECRET: process.env.CLOUDINARY_API_SECRET as string,
    },
    STRIPE: {
      SECRET_KEY: process.env.STRIPE_SECRET_KEY as string,
      WEBHOOK_SECRET: process.env.STRIPE_WEBHOOK_SECRET as string,
    },
    FRONTEND_URL: process.env.FRONTEND_URL as string,
    BACKEND_URL: process.env.BACKEND_URL as string,
    GOOGLE: {
      CLIENT_ID: process.env.GOOGLE_CLIENT_ID as string,
      CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET as string,
    },
    ADMIN: {
      NAME: process.env.ADMIN_NAME,
      EMAIL: process.env.ADMIN_EMAIL,
      PASSWORD: process.env.ADMIN_PASSWORD,
    },
  };
};

export const envVars = loadEnv();
