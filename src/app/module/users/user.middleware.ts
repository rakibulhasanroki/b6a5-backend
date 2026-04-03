/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextFunction, Request, Response } from "express";
import { IUpdateUserPayload } from "./users.interface";

export const updateUserProfileMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (req.body.data) {
    req.body = JSON.parse(req.body.data) as IUpdateUserPayload;
  }

  if (req.file) {
    req.body.image = (req.file as any).path;
  }

  next();
};
