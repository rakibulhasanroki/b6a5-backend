/* eslint-disable @typescript-eslint/no-explicit-any */
import { Request } from "express";
import { deleteFileFromCloudinary } from "../config/cloudinary.config";

export const deleteUploadedFileFromCloudinary = async (req: Request) => {
  try {
    const file = req.file as any;

    if (!file) return;

    const fileUrl = file.path || file.secure_url || file.url;

    if (fileUrl) {
      await deleteFileFromCloudinary(fileUrl);
    }
  } catch (error) {
    console.error("Cleanup failed:", error);
  }
};
