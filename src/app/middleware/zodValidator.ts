import { NextFunction, Request, Response } from "express";
import { z } from "zod";
import AppError from "../errorHelpers/AppError";
import status from "http-status";

export const zodValidator = (
  schema: z.ZodType,
  source: "body" | "query" = "body",
) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (source === "body" && typeof req.body?.data === "string") {
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

      const data = source === "body" ? req.body : req.query;

      const parsedResult = schema.safeParse(data);

      if (!parsedResult.success) {
        return next(parsedResult.error);
      }

      if (source === "body") {
        req.body = parsedResult.data;
      } else {
        Object.assign(req.query, parsedResult.data);
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};
