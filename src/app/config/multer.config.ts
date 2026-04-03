import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary.config";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req: Request, file: Express.Multer.File) => {
    const isPdf = file.mimetype === "application/pdf";
    return {
      folder: isPdf ? "planora/invoices" : "planora/profile",
      public_id: `${Date.now()}-${file.originalname.split(".")[0]}`,
      resource_type: "auto",
    };
  },
});

export const upload = multer({ storage });
