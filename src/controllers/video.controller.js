import mongoose from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Video } from "../models/video.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import {
  deleteFromCloudinary,
  uploadOnCloudinary,
} from "../utils/cloudinary.js";

const getAllVideos = asyncHandler(async (req, res) => {});

const publishAVideo = asyncHandler(async (req, res) => {});

const getVideoById = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.isValidObjectId(videoId))
    throw new ApiError(400, "Invalid video Id!");

  const video = await Video.findById(videoId);

  if (!video) throw new ApiError(404, "No video found!");

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video fetched successfully!"));
});

const updateVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { title, description } = req.body;

  if (!mongoose.isValidObjectId(videoId))
    throw new ApiError(400, "Invalid video Id!");

  const trimmedTitle = title?.trim();
  const trimmedDescription = description?.trim();

  if (!trimmedTitle || !trimmedDescription)
    throw new ApiError(400, "Title or description is missing!");

  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(404, "Video not found!");

  const oldThumbnailCloudinaryPath = video?.thumbnail;

  const newThumbnailLocalPath = req.file?.path;
  if (!newThumbnailLocalPath)
    throw new ApiError(400, "Thumbnail not uploaded on local Server!");

  const newThumbnail = await uploadOnCloudinary(newThumbnailLocalPath);
  if (!newThumbnail.url)
    throw new ApiError(400, "Error while uploading thumbnail to cloudinary!");

  video.thumbnail = newThumbnail.url;
  video.title = trimmedTitle;
  video.description = trimmedDescription;
  await video.save();

  const oldThumbnailDeleted = await deleteFromCloudinary(
    oldThumbnailCloudinaryPath,
  );
  if (!oldThumbnailDeleted)
    throw new ApiError(
      400,
      "Error while deleting old thumbnail from cloudinary!",
    );

  return res
    .status(200)
    .json(new ApiResponse(200, video, "Video details updated successfully!"));
});

const deleteVideo = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.isValidObjectId(videoId))
    throw new ApiError(400, "Invalid video Id!");

  const deletedVideo = await Video.findByIdAndDelete(videoId);
  if (!deletedVideo) throw new ApiError(404, "Video not found!");

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Video deleted successfully!"));
});

const togglePublishStatus = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.isValidObjectId(videoId))
    throw new ApiError(400, "Invalid Video Id!");

  const video = await Video.findOneAndUpdate(
    { _id: videoId, owner: req.user._id },
    [
      {
        $set: { isPublished: { $not: "$isPublished" } },
      },
    ],
    { new: true },
  );

  if (!video) throw new ApiError(404, "Video not found!");

  return res.status(200).json(new ApiResponse(200, video, "Publish Toggled"));
});

export {
  getAllVideos,
  publishAVideo,
  getVideoById,
  updateVideo,
  deleteVideo,
  togglePublishStatus,
};
