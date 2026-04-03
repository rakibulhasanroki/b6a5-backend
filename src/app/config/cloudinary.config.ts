import { v2 as cloudinary } from "cloudinary";
import { envVars } from "./env";

cloudinary.config({
  cloud_name: envVars.CLOUDINARY.CLOUD_NAME,
  api_key: envVars.CLOUDINARY.API_KEY,
  api_secret: envVars.CLOUDINARY.API_SECRET,
});

export default cloudinary;

//  delete function
export const deleteFileFromCloudinary = async (url: string) => {
  try {
    const regex = /\/v\d+\/(.*?)(?:\.[a-zA-Z0-9]+)?$/;
    const publicId = url.match(regex)?.[1];

    if (!publicId) return;

    const resourceTypes = ["image", "raw"];

    for (const type of resourceTypes) {
      await cloudinary.uploader.destroy(publicId, {
        resource_type: type,
      });
    }
  } catch (error) {
    console.error("Cloudinary delete failed:", error);
  }
};
