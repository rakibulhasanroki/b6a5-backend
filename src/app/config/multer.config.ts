import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary.config";
import { Request } from "express";
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req: Request, file: Express.Multer.File) => {
    const isEventRoute = req.originalUrl.includes("/events");
    const isPdf = file.mimetype === "application/pdf";
    return {
      folder: isPdf
        ? "planora/invoices"
        : isEventRoute
          ? "planora/events"
          : "planora/profile",
      public_id: `${Date.now()}-${file.originalname.split(".")[0]}`,
      resource_type: "auto",
    };
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});
