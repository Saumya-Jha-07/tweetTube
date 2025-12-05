import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { User } from "../models/user.model.js";
import { uploadOnCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/ApiResponse.js";

async function generateAccessAndRefreshTokens(user) {
  try {
    // step 3
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    // step 4
    user.refreshToken = refreshToken;
    await user.save({
      validateBeforeSave: true,
    });

    return { accessToken, refreshToken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating JWT tokens !",
    );
  }
}

export const registerUser = asyncHandler(async (req, res) => {
  // step 1 : get the user text details
  const { userName, fullName, email, password } = req.body;

  // step 2 : upload the file to local server ( done using middleware )

  // step 3 : validate the deatils
  if (userName === "") throw new ApiError(400, "Username is missing !");
  if (fullName === "") throw new ApiError(400, "fullName is missing !");
  if (email === "") throw new ApiError(400, "email is missing !");
  if (password === "") throw new ApiError(400, "password is missing !");

  // step 4 : check if user already exists
  const existedUser = await User.findOne({
    $or: [{ userName }, { email }],
  });
  if (existedUser)
    throw new ApiError(409, "User with username or email already exists ");

  // step 5 : check for images/files locally
  const avatarLocalPath = req.files?.avatar[0]?.path;

  let coverImageLocalPath;
  if (
    req.files &&
    Array.isArray(req.files.coverImage) &&
    req.files.coverImage.length > 0
  ) {
    coverImageLocalPath = req.files.coverImage[0].path;
  }

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
  return res
    .status(201)
    .json(new ApiResponse(201, createdUser, "User registered successfully !"));
});

export const loginUser = asyncHandler(async (req, res) => {
  // step 1
  const { email, password } = req.body;
  if (!password) throw new ApiError(400, "Password is missing !");
  if (!email) throw new ApiError(400, "Email is missing !");

  // step 2
  const user = await User.findOne({ email });
  if (!user) throw new ApiError(401, "User with this email does not exist!");

  const isMatch = await user.isPasswordCorrect(password);

  if (!isMatch) throw new ApiError(401, "Password is incorrect!");

  // step 3 and 4
  const { accessToken, refreshToken } =
    await generateAccessAndRefreshTokens(user);

  // step 5 and 6
  const options = {
    httpOnly: true,
    secure: true,
  };

  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken",
  );

  return res
    .cookie("accessToken", accessToken, options)
    .cookie("refreshToken", refreshToken, options)
    .status(200)
    .json(new ApiResponse(200, loggedInUser, "User loggedIn successful !"));
});

export const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, {
    $unset: {
      refreshToken: 1,
    },
  });

  const options = {
    httpOnly: true,
    secure: true,
  };

  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User Logged out!"));
});

// export const refreshUser = asyncHandler(async (req, res) => {
//   // step 1
//   const cookies = req.cookies;
//   if (!cookies) throw new ApiError(401, "User not authenticated !");

//   const refreshToken = cookies?.refreshToken;
//   if (!refreshToken) throw new ApiError(401, "User not authenticated !");

// });
