import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Video } from "../models/video.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { Comment } from "../models/comment.model.js";

const getVideoComments = asyncHandler(async (req, res) => {
  const { videoId } = req.params;
  const { page = 1, limit = 10 } = req.query;

  if (!videoId || !isValidObjectId(videoId))
    throw new ApiError(400, "Invalid videoId!");

  const pipeline = [
    {
      $match: {
        video: new mongoose.Types.ObjectId(videoId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "owner",
        foreignField: "_id",
        as: "owner",
        pipeline: [
          {
            $project: {
              _id: 0,
              userName: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $unwind: "$owner",
    },
  ];

  if (!pipeline.length) throw new ApiError(404, "Comment not found!");

  const result = await Comment.aggregatePaginate(Comment.aggregate(pipeline), {
    page,
    limit,
  });

  if (!result) throw new ApiError(404, "Error while paginating!");

  return res
    .status(200)
    .json(new ApiResponse(200, result, "Fetched video comments successfully!"));
});

const addComment = asyncHandler(async (req, res) => {
  const { content } = req.body;
  const { videoId } = req.params;

  if (!content?.trim()) throw new ApiError(400, "Content cannot be empty!");
  if (!isValidObjectId(videoId))
    throw new ApiError(400, "Video ID is invalid!");

  const video = await Video.findById(videoId);
  if (!video) throw new ApiError(404, "Video not found!");

  const newComment = await Comment.create({
    content,
    video: videoId,
    owner: req.user._id,
  });

  if (!newComment) throw new ApiError(404, "Comment not found!");

  return res
    .status(201)
    .json(new ApiResponse(201, newComment, "Comment added successfull!"));
});

const deleteComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;

  if (!isValidObjectId(commentId))
    throw new ApiError(400, "Invalid Comment Id");

  const comment = await Comment.findById(commentId);
  if (!comment) throw new ApiError(404, "Comment not found!");

  await Comment.findOneAndDelete({
    _id: commentId,
    owner: req.user?._id,
  });

  return res
    .status(204)
    .json(new ApiResponse(204, {}, "Comment deleted successfully!"));
});

const updateComment = asyncHandler(async (req, res) => {
  const { commentId } = req.params;
  const { newComment } = req.body;

  if (!newComment?.trim()) throw new ApiError(400, "Content cannot be empty!");
  if (!isValidObjectId(commentId)) throw new ApiError(400, "Invalid Comment!");

  const comment = await Comment.findById(commentId);
  if (!comment) throw new ApiError(404, "Comment not found!");

  const updatedComment = await Comment.findOneAndUpdate({
    _id: commentId,
    owner: req.user?._id,
  });

  if (!updatedComment) throw new ApiError(404, "Update Comment issue!");

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedComment, "Comment Updated successfully!"),
    );
});

export { addComment, updateComment, deleteComment, getVideoComments };
