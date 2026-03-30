import { Response } from "express";

interface IResponse<T> {
  httpStatus: number;
  success: boolean;
  message: string;
  data?: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const sendResponse = <T>(res: Response, responseData: IResponse<T>) => {
  const { httpStatus, message, success, data, meta } = responseData;
  res.status(httpStatus).json({
    success,
    message,
    data,
    meta,
  });
};
