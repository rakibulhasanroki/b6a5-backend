/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { NextFunction, Request, Response } from "express";
import status from "http-status";
import { Prisma } from "../../generated/prisma/client";
import AppError from "../errorHelpers/AppError";
import { deleteUploadedFileFromCloudinary } from "../utils/deleteUploadedFileFromCloudinary";
import { ZodError } from "zod";

export const globalErrorHandler = async (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  await deleteUploadedFileFromCloudinary(req);

  let statusCode: number = status.INTERNAL_SERVER_ERROR;
  let message: string = "Something went wrong";
  let errorSources: { path: string; message: string }[] = [];

  if (err instanceof ZodError) {
    statusCode = status.BAD_REQUEST;
    message = "Validation Error";

    errorSources = err.issues.map((issue: any) => ({
      path:
        issue.path.length > 0
          ? issue.path.join(".")
          : issue.code === "unrecognized_keys"
            ? issue.keys?.join(",") || "unknown"
            : "unknown",
      message: issue.message,
    }));
  } else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case "P2002":
        statusCode = status.CONFLICT;
        message = "Duplicate field value";

        errorSources = [
          {
            path: (err.meta?.target as string[])?.join(",") || "field",
            message: "This value already exists",
          },
        ];
        break;

      case "P2025":
        statusCode = status.NOT_FOUND;
        message = "Resource not found";
        break;

      case "P2003":
        statusCode = status.BAD_REQUEST;
        message = "Foreign key constraint failed";

        errorSources = [
          {
            path: (err.meta?.field_name as string) || "relation",
            message: "Invalid reference to related resource",
          },
        ];
        break;

      case "P2014":
        statusCode = status.BAD_REQUEST;
        message = "Invalid relation operation";
        break;

      default:
        statusCode = status.BAD_REQUEST;
        message = "Database request error";
        break;
    }
  } else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = status.BAD_REQUEST;
    message = "Invalid data provided to database";
  } else if (err instanceof Prisma.PrismaClientInitializationError) {
    statusCode = status.SERVICE_UNAVAILABLE;
    message = "Database connection failed";
  } else if (err instanceof Prisma.PrismaClientUnknownRequestError) {
    statusCode = status.INTERNAL_SERVER_ERROR;
    message = "Unknown database error occurred";
  } else if (err instanceof Prisma.PrismaClientRustPanicError) {
    statusCode = status.INTERNAL_SERVER_ERROR;
    message = "Database engine crashed";
  } else if (err instanceof AppError) {
    statusCode = err.statusCode;
    message = err.message;
  } else if (err instanceof Error) {
    message = err.message;
  }

  res.status(statusCode).json({
    success: false,
    message,
    errorSources: errorSources.length ? errorSources : undefined,
    stack: process.env.NODE_ENV === "development" ? err?.stack : undefined,
  });
};
