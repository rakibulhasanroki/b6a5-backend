/* eslint-disable @typescript-eslint/no-explicit-any */
import cloudinary from "../config/cloudinary.config";
import streamifier from "streamifier";
export const uploadBufferToCloudinary = (
  buffer: Buffer,
  publicId: string,
): Promise<any> => {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "auto",
        folder: "planora/invoices",
        public_id: publicId,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });
};
