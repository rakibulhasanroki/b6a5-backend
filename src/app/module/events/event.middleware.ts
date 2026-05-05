/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import { CreateEventPayload } from "./event.interface";

export const createEventMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.body.data) {
    req.body = JSON.parse(req.body.data) as CreateEventPayload;
  }

  if (req.file) {
    req.body.image = (req.file as any).path;
  }

  next();
};
