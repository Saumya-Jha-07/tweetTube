import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

async function uploadOnCloudinary(localPath) {
  try {
    // imp check
    if (!localPath) return null;

    // upload the file to cloudinary
    const uploadResponse = await cloudinary.uploader.upload(localPath, {
      resource_type: "auto",
    });

    // after the successful upload
    console.log("File uploaded on cloudinary : ", uploadResponse.url);

    // delete from the local server
    try {
      fs.unlinkSync(localPath);
      console.log("Local file deleted : ", localPath);
    } catch (unlinkErr) {
      console.log("Failed to delete the local file : ", localPath);
    }

    return uploadResponse;
  } catch (error) {
    // localPath to hai , but upload nai ho paya , isliye retry ke liye rkh rhe hai file
    console.error("Not able to upload the file on cloudinary : ", error);
    return null;
  }
}

export { uploadOnCloudinary };
