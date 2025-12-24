import mongoose from "mongoose";
import { Video } from "../models/video.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getChannelStats = asyncHandler(async (req, res) => {
  if (!mongoose.isValidObjectId(req.user._id))
    throw new ApiError(400, "Invalid owner Id!");

  const totalVideos = await Video.countDocuments({ owner: req.user._id });
});

const getChannelVideos = asyncHandler(async (req, res) => {
  const channelVideos = await Video.find({
    owner: req.user._id,
  });

  if (!channelVideos) throw new ApiError(404, "Videos not found!");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        channelVideos,
        "Channel Videos fetched successfully!",
      ),
    );
});

export { getChannelStats, getChannelVideos };
