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

function getPublicIdFromCloudinaryUrl(url) {
  try {
    // 1. Get everything after /upload/
    const parts = url.split("/upload/");
    if (parts.length !== 2) return null;

    let publicIdWithVersion = parts[1];
    // Example: v1764741675/b6igv8sub.jpg

    // 2. Remove version (v12345/)
    publicIdWithVersion = publicIdWithVersion.replace(/^v\d+\//, "");
    // Example: b6igv8sub.jpg

    // 3. Remove extension (.jpg, .png, .pdf, etc.)
    const publicId = publicIdWithVersion.replace(/\.[^/.]+$/, "");
    // Example: b6igv8sub

    return publicId;
  } catch (err) {
    console.error("Invalid Cloudinary URL:", err);
    return null;
  }
}

async function deleteFromCloudinary(url) {
  try {
    if (!url) {
      console.log("Cloudinary Url to delete not found!");
      return false;
    }

    const publicId = getPublicIdFromCloudinaryUrl(url);
    console.log(publicId);

    if (!publicId) {
      console.log("Public Id not found!");
      return false;
    }

    const res = await cloudinary.uploader.destroy(publicId, {
      resource_type: "image",
    });

    if (res.result !== "ok") {
      console.log("Error while deleting the file from cloudinary!");
      return false;
    }

    console.log("Cloudinary Deleted successfully!");
    return true;
  } catch (error) {
    console.log("Unexpected Error while deleting the file : ", error.message);
    return false;
  }
}

export { uploadOnCloudinary, deleteFromCloudinary };
