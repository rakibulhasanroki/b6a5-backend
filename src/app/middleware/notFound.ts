import { Request, Response } from "express";
import status from "http-status";

export function notFound(req: Request, res: Response) {
  res.status(status.NOT_FOUND).json({
    message: `Route  ${req.originalUrl} not found`,
    path: req.originalUrl,
    date: Date(),
  });
}
