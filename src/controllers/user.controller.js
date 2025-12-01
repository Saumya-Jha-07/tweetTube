import { asyncHandler } from "../utils/asyncHandler.js";

export const registerUser = asyncHandler((req, res) => {
  res.status(200).json({
    message: "ok",
  });
});
