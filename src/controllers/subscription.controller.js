import mongoose, { isValidObjectId } from "mongoose";
import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { Subscription } from "../models/subscription.model.js";
import { ApiResponse } from "../utils/ApiResponse.js";

// user ne to kitno ko subscribe kiya hai ( channel list return krna hai )
const getSubscribedChannels = asyncHandler(async (req, res) => {
  const { subscriberId } = req.params;

  if (!isValidObjectId(subscriberId))
    throw new ApiError(404, "Invalid Subscriber Id!");

  const subscribedChannels = await Subscription.aggregate([
    {
      $match: {
        subscriber: new mongoose.Types.ObjectId(subscriberId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "channel",
        foreignField: "_id",
        as: "channel",
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
      $unwind: "$channel",
    },
    {
      $replaceRoot: {
        newRoot: "$channel",
      },
    },

    // {
    //   $project : {
    //     channel : 1,
    //     _id : 0
    //   }
    // },
  ]);

  if (!subscribedChannels.length)
    throw new ApiError(404, "Subscribed Channels not found!");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        subscribedChannels,
        "Subscribed Channels fetched successfully!",
      ),
    );
});

const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  if (!isValidObjectId(channelId))
    throw new ApiError(400, "Invalid channel id!");

  const isSubscribedAndDeleted = await Subscription.findOneAndDelete(
    { subscriber: req.user._id },
    { channel: channelId },
  );

  if (isSubscribedAndDeleted) {
    return res
      .status(200)
      .json(new ApiResponse(200, {}, "Channel unsubscribed!"));
  }

  await Subscription.create({
    subscriber: req.user._id,
    channel: channelId,
  });

  return res.status(201).json(new ApiResponse(201, {}, "Channel Subscribed!"));
});

const getUserChannelSubscribers = asyncHandler(async (req, res) => {
  const { channelId } = req.params;

  if (!isValidObjectId(channelId))
    throw new ApiError(400, "Invalid Channel ID!");

  const channelSubscribers = await Subscription.aggregate([
    {
      $match: {
        channel: new mongoose.Types.ObjectId(channelId),
      },
    },
    {
      $facet: {
        subscribers: [
          {
            $lookup: {
              from: "users",
              localField: "subscriber",
              foreignField: "_id",
              as: "subscriber",
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
            $unwind: "$subscriber",
          },
          {
            $replaceRoot: {
              newRoot: "$subscriber",
            },
          },
        ],
        count: [{ $count: "total" }],
      },
    },
  ]);

  if (!channelSubscribers.length)
    throw new ApiError(404, "Subscribers not found!");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        channelSubscribers,
        "Channel Subscribers fetched successfully!",
      ),
    );
});

export { getSubscribedChannels, getUserChannelSubscribers, toggleSubscription };
