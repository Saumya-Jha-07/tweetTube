import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { ApiError } from "../utils/ApiError.js";
import { Tweet } from "../models/tweet.model.js";
import { User } from "../models/user.model.js";
import mongoose, { isValidObjectId } from "mongoose";

const createTweet = asyncHandler(async (req, res) => {
  const { content } = req.body;

  if (!content?.trim()) throw new ApiError(400, "Content can not be empty");

  const createdTweet = await Tweet.create({
    content: content.trim(),
    owner: req.user._id,
  });

  if (!createdTweet) throw new ApiError(400, "Error while creating new Tweet!");

  return res
    .status(201)
    .json(new ApiResponse(201, createdTweet, "Tweet created successfully!"));
});

const getUserTweets = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!userId) throw new ApiError(400, "User Id is missing!");

  const userTweets = await User.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(userId),
      },
    },
    {
      $lookup: {
        from: "tweets",
        localField: "_id",
        foreignField: "owner",
        as: "tweets",
        pipeline: [
          {
            $project: {
              content: 1,
            },
          },
        ],
      },
    },
    {
      $project: {
        userName: 1,
        fullName: 1,
        avatar: 1,
        tweets: 1,
      },
    },
  ]);

  if (!userTweets.length) throw new ApiError(404, "User not found!");

  return res
    .status(200)
    .json(
      new ApiResponse(200, userTweets[0], "User tweets fetched successfully!"),
    );
});

const updateTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;
  const { newContent } = req.body;

  if (!newContent?.trim()) throw new ApiError(400, "Content is missing!");
  if (!isValidObjectId(tweetId)) throw new ApiError(400, "TweetId is Invalid!");

  const updatedTweet = await Tweet.findOneAndUpdate(
    { _id: tweetId, owner: req.user?._id },
    {
      $set: {
        content: newContent.trim(),
      },
    },
    { new: true },
  );

  if (!updatedTweet) throw new ApiError(404, "Error while updating the tweet!");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedTweet, "Tweet updated successfully!"));
});

const deleteTweet = asyncHandler(async (req, res) => {
  const { tweetId } = req.params;

  if (!isValidObjectId(tweetId))
    throw new ApiError(400, "Tweet Id is Invalid!");

  const deletedTweet = await Tweet.findOneAndDelete({
    _id: tweetId,
    owner: req.user._id,
  });

  if (!deletedTweet) throw new ApiError(400, "Error while deleting the tweet!");

  return res
    .status(200)
    .json(new ApiResponse(200, deletedTweet, "Tweet deleted successfully!"));
});

export { createTweet, getUserTweets, updateTweet, deleteTweet };
