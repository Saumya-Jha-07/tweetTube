import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

export const registerUser = asyncHandler(async (req, res) => {
  // step 1 : get the user text details
  const { userName, fullName, email, password } = req.body;

  // step 2 : upload the file to local server ( done using middleware )

  // step 3 : validate the deatils
  if (userName.trim() === "") throw new ApiError(400, "Username is missing !");
  if (fullName.trim() === "") throw new ApiError(400, "fullName is missing !");
  if (email.trim() === "") throw new ApiError(400, "email is missing !");
  if (password.trim() === "") throw new ApiError(400, "password is missing !");

  // step 4 : check if user already exists
  const existedUser = User.findOne({ userName });
  if (existedUser) throw new ApiError(409, "Username already exists ");

  // step 5 : check for images/files locally
  const avatarLocalPath = req.files?.avatar[0]?.path;
  const coverImageLocalPath = req.files?.coverImage[0]?.path;

  if (!avatarLocalPath)
    throw new ApiError(400, "Avatar is missing in local server !");

  // step 6 : upload to cloudinary
  const avatar = await uploadOnCloudinary(avatarLocalPath);
  const coverImage = await uploadOnCloudinary(coverImageLocalPath);

  if (!avatar) throw new ApiError(400, "Avatar not uploaded to cloudinary !");

  // step 7 : create and insert a user object to db
  const user = await User.create({
    fullName,
    userName: userName.toLowerCase(),
    email,
    password,
    avatar: avatar.url,
    coverImage: coverImage?.url || "",
  });

  // step 8 and 9 : check for user and if created remove the pass and token field
  const createdUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );
  if (!createdUser)
    throw new ApiError(500, "Something went wrong while registering the user!");

  // step 10 : return the user
  return new ApiResponse(201, createdUser, "User registered successfully !");
});
