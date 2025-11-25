import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    userName: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
      minlength: [5, "Username must contain atleast 5 characters"],
      maxlength: [15, "Username can have maximum 15 characters only!"],
    },
    fullName: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
    },
    watchHistory: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Video",
      },
    ],
    avatar: {
      type: String, // cloudinary url
    },
    coverImage: {
      type: String,
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true },
);

export const User = mongoose.model("User", userSchema);
