import { v2 as cloudinary } from "cloudinary";
import { envVars } from "./env";

cloudinary.config({
  cloud_name: envVars.CLOUDINARY.CLOUD_NAME,
  api_key: envVars.CLOUDINARY.API_KEY,
  api_secret: envVars.CLOUDINARY.API_SECRET,
});

export default cloudinary;

//  delete function
export const deleteFileFromCloudinary = async (input: string) => {
  try {
    let publicId: string | null = null;

    if (input.startsWith("http")) {
      const regex = /\/v\d+\/(.*?)(?:\.[a-zA-Z0-9]+)?$/;
      publicId = input.match(regex)?.[1] || null;
    } else {
      publicId = input;
    }

    if (!publicId) return;

    const resourceTypes = ["image", "raw"];

    await Promise.allSettled(
      resourceTypes.map((type) =>
        cloudinary.uploader.destroy(publicId, {
          resource_type: type,
        }),
      ),
    );
  } catch (error) {
    console.error("Cloudinary delete failed:", error);
  }
};
