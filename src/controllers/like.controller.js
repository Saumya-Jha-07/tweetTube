import mongoose from "mongoose";
import { Like } from "../models/like.model.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Comment } from "../models/comment.model.js";
import { Tweet } from "../models/tweet.model.js";

const toggleVideoLike = asyncHandler(async (req, res) => {
  const { videoId } = req.params;

  if (!mongoose.isValidObjectId(videoId))
    throw new ApiError(400, "Invalid video Id!");

  const deletedLike = await Like.findOneAndDelete(
    { video: videoId }, // mongoose khud cast kr lega to Id
    { likedBy: req.user._id },
  );

  if (deletedLike)
    return res.status(200).json(new ApiResponse(200, {}, "Video unliked!"));

  await Like.create({
    likedBy: req.user._id,
    video: videoId,
  });

  return res.status(201).json(new ApiResponse(201, {}, "Video Liked!"));
});

const toggleCommentLike = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!mongoose.isValidObjectId(commentId))
    throw new ApiError(400, "Invalid Comment Id!");

  const deletedComment = await Comment.findOneAndDelete(
    { comment: commentId }, // mongoose khud cast kr lega to Id
    { likedBy: req.user._id },
  );

  if (deletedComment)
    return res.status(200).json(new ApiResponse(200, {}, "Comment unliked!"));

  await Comment.create({
    likedBy: req.user._id,
    comment: commentId,
  });

  return res.status(201).json(new ApiResponse(201, {}, "Comment Liked!"));
});

const toggleTweetLike = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!mongoose.isValidObjectId(tweetId))
    throw new ApiError(400, "Invalid Tweet Id!");

  const deletedTweet = await Tweet.findOneAndDelete(
    { tweet: tweetId }, // mongoose khud cast kr lega to Id
    { likedBy: req.user._id },
  );

  if (deletedTweet)
    return res.status(200).json(new ApiResponse(200, {}, "Tweet unliked!"));

  await Tweet.create({
    likedBy: req.user._id,
    tweet: tweetId,
  });

  return res.status(201).json(new ApiResponse(201, {}, "Tweet Liked!"));
});

const getLikedVideos = asyncHandler(async (req, res) => {
  const likedVideos = await Like.aggregate([
    {
      $match: {
        likedBy: new mongoose.Types.ObjectId(req.user._id),
        video: { $type: "objectId" },
      },
    },
    {
      $lookup: {
        from: "videos",
        localField: "video",
        foreignField: "_id",
        as: "video",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "owner",
              foreignField: "_id",
              as: "owner",
              pipeline: [
                {
                  $project: {
                    userName: 1,
                    fullName: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $project: {
              isPublished: 0,
              createdAt: 0,
              updatedAt: 0,
            },
          },
          {
            $unwind: "$owner",
          },
        ],
      },
    },
    {
      $unwind: "$video",
    },
    {
      $project: {
        _id: 0,
        video: 1,
      },
    },
  ]);

  if (!likedVideos.length) throw new ApiError(404, "Liked videos missing!");

  return res
    .status(200)
    .json(
      new ApiResponse(200, likedVideos, "Liked Videos fetched successfully!"),
    );
});

export { toggleCommentLike, toggleVideoLike, toggleTweetLike, getLikedVideos };
