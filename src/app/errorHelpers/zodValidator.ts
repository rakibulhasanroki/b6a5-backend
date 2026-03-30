import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import AppError from "../errorHelpers/AppError";
import status from "http-status";

export const zodValidator = (schema: z.ZodType) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (typeof req.body?.data === "string") {
        try {
          req.body = JSON.parse(req.body.data);
        } catch {
          return next(
            new AppError(
              status.BAD_REQUEST,
              "Invalid JSON format in 'data' field",
            ),
          );
        }
      }

      const parsedResult = schema.safeParse(req.body);

      if (!parsedResult.success) {
        return next(parsedResult.error);
      }

      req.body = parsedResult.data;

      next();
    } catch (error) {
      next(error);
    }
  };
};
