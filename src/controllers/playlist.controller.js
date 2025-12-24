import mongoose from "mongoose";
import { Playlist } from "../models/playlist.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  const trimmedName = name?.trim();
  if (!trimmedName) throw new ApiError(404, "Name is required !");

  const playlist = await Playlist.create({
    name,
    description,
    owner: req.user._id,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, playlist, "Playlist created successfully!"));
});

const getPlaylistById = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!mongoose.isValidObjectId(playlistId))
    throw new ApiError(400, "Invalid Playlist Id!");

  const playlist = await Playlist.findById({ _id: playlistId });

  if (!playlist) throw new ApiError(404, "Playlist not found!");

  return res
    .status(200)
    .json(new ApiResponse(200, playlist, "Playlist found!"));
});

const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;

  const trimmedName = name?.trim();

  if (!mongoose.isValidObjectId(playlistId))
    throw new ApiError(400, "Invalid playlist Id!");

  if (!trimmedName) throw new ApiError(400, "Name cannot be empty!");

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    { name, description },
    { new: true },
  );

  if (!updatedPlaylist) throw new ApiError(404, "Playlist not found!");

  return res
    .status(200)
    .json(
      new ApiResponse(200, updatedPlaylist, "Playlist updated successfully!"),
    );
});

const deletePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!mongoose.isValidObjectId(playlistId))
    throw new ApiError(400, "Invalid playlist Id!");

  const deletedPlaylist = await Playlist.findByIdAndDelete(playlistId);

  if (!deletedPlaylist) throw new ApiError(404, "Playlist not found!");

  return res
    .status(204)
    .json(new ApiResponse(204, {}, "Playlist deleted successfully!"));
});

const addVideoToPlaylist = asyncHandler(async (req, res) => {
  const { videoId, playlistId } = req.params;

  if (
    !mongoose.isValidObjectId(videoId) ||
    !mongoose.isValidObjectId(playlistId)
  )
    throw new ApiError(400, "Invalid Video or Playlist Id !");

  const updatedPlaylist = await Playlist.findOneAndUpdate(
    { _id: playlistId, owner: req.user?._id },
    {
      $addToSet: { videos: videoId },
    },
    { new: true },
  );

  if (!updatedPlaylist)
    throw new ApiError(404, "Playlist not found or forbidden!");

  return res
    .status(200)
    .json(new ApiResponse(200, updatedPlaylist, "Video added to playlist!"));
});

const removeVideoFromPlaylist = asyncHandler(async (req, res) => {
  const { videoId, playlistId } = req.params;

  if (
    !mongoose.isValidObjectId(videoId) ||
    !mongoose.isValidObjectId(playlistId)
  )
    throw new ApiError(400, "Invalid Video or Playlist Id !");

  const updatedPlaylist = await Playlist.findOneAndUpdate(
    { _id: playlistId, owner: req.user?._id },
    {
      $pull: { videos: videoId },
    },
    { new: true },
  );

  if (!updatedPlaylist)
    throw new ApiError(404, "Playlist not found or forbidden!");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        updatedPlaylist,
        "Video removed from playlist successfully!",
      ),
    );
});

const getUserPlaylists = asyncHandler(async (req, res) => {
  const { userId } = req.params;

  if (!mongoose.isValidObjectId(userId))
    throw new ApiError(400, "Invalid user Id!");

  const userPlaylists = await Playlist.find({ owner: userId }).populate(
    "videos thumbnail",
  );

  if (!userPlaylists) throw new ApiError(404, "No playlist found!");

  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        userPlaylists,
        "User playlist fetched successfully!",
      ),
    );
});

export {
  createPlaylist,
  getPlaylistById,
  updatePlaylist,
  deletePlaylist,
  addVideoToPlaylist,
  removeVideoFromPlaylist,
  getUserPlaylists,
};
